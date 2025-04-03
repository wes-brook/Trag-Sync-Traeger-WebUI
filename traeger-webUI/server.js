import express from 'express';
import cors from 'cors';
import Manager from './utils/manager.js'; // Adjust path if needed
import dotenv from 'dotenv';
import http from 'http'; // Import Node's http module
import { Server as SocketIOServer } from 'socket.io'; // Import Socket.IO Server

// Use a structured logger
const logging = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: process.env.NODE_ENV !== 'production' ? console.debug : () => {},
};

// Log current time at startup for reference
logging.log(`Server process starting at: ${new Date().toISOString()}`);

// Load environment variables
dotenv.config();

// --- Configuration and Validation ---
const { TRAEGER_USERNAME, TRAEGER_PASSWORD, PORT = 3001 } = process.env;

if (!TRAEGER_USERNAME || !TRAEGER_PASSWORD) {
  logging.error('FATAL: Missing required environment variables (TRAEGER_USERNAME, TRAEGER_PASSWORD)');
  process.exit(1);
}

// --- CORS Configuration ---
// List specific origins allowed to connect (frontend URL, localhost for dev)
const allowedOrigins = [
    'http://localhost:3000', // Example: Local React dev server
    'http://127.0.0.1:3000',
    // Add the URL of your deployed frontend application here
    // 'https://your-traeger-ui.com'
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      const msg = `CORS policy does not allow access from origin: ${origin}`;
      logging.warn(msg);
      return callback(new Error(msg), false);
    }
  },
  methods: "GET,POST", // Adjust allowed HTTP methods if needed
};

// --- Express App Setup ---
const app = express();
app.use(cors(corsOptions)); // Apply CORS to HTTP requests
app.use(express.json());

// --- Create HTTP Server and Socket.IO Server ---
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { // Apply CORS options to Socket.IO connections as well
    origin: allowedOrigins,
    methods: ["GET", "POST"] // Required for Socket.IO transport mechanisms
  }
});

// --- Manager Instance ---
let manager;
try {
    manager = new Manager(TRAEGER_USERNAME, TRAEGER_PASSWORD);
} catch(error) {
    logging.error("FATAL: Failed to instantiate Manager:", error);
    process.exit(1);
}

// --- Helper Function (Data Formatting) ---
function formatGrillData(grill) {
    if (!grill || typeof grill.data !== 'object') {
      logging.warn('formatGrillData received invalid grill object:', grill);
      return null;
    }
    const details = grill.data.details ?? {};
    const status = grill.data.status ?? {};
    const rawConnected = status.connected ?? manager?.isGrillConsideredOnline ?? false;

    return {
      grillName: details.friendlyName ?? 'GRILL NAME',
      currentTemp: status.grill ?? 0,
      setTemp: status.set ?? 0,
      probeTemp: status.probe ?? 0,
      probeSetTemp: status.probe_set ?? 0,
      connected: rawConnected,
      systemStatus: status.system_status ?? 99,
      pelletLevel: status.pellet_level ?? null,
      units: status.units === 1 ? 'F' : (status.units === 0 ? 'C' : '?'), // Handle units
      serverTime: new Date().toISOString(),
      lastGrillUpdate: grill.lastUpdate ? new Date(grill.lastUpdate).toISOString() : null,
      grillTimestamp: status.time ? new Date(status.time * 1000).toISOString() : null,
    };
}

// --- Socket.IO Connection Handling ---
io.on('connection', (socket) => {
  logging.log(`Socket connected: ${socket.id}`);
  // Send initial state to newly connected client
  if (manager && manager.isReady() && manager.api.grills.length > 0) {
      const currentGrill = manager.api.grills[0];
      const formattedData = formatGrillData(currentGrill);
      if (formattedData) {
          logging.debug(`Sending initial state to socket ${socket.id}`);
          socket.emit('grillStateUpdate', formattedData); // Only to new client
      }
  } else {
       logging.warn(`Manager not ready or no grills available when socket ${socket.id} connected.`);
       socket.emit('grillStatus', { status: manager?.isInitializing ? 'initializing' : 'unavailable' });
  }
  socket.on('disconnect', () => {
    logging.log(`Socket disconnected: ${socket.id}`);
  });
  // Placeholder for commands:
  // socket.on('someCommand', (payload) => { /* Handle command */ });
});

// --- Listen for Manager Updates and Broadcast ---
if (manager) {
  manager.on('grillUpdate', (updatedGrill) => {
    logging.debug(`Manager emitted grillUpdate for ${updatedGrill.identifier}`);
    const formattedData = formatGrillData(updatedGrill);
    if (formattedData) {
      io.emit('grillStateUpdate', formattedData); // Broadcast to ALL clients
      logging.debug('Broadcasted grillStateUpdate to connected sockets.');
    } else {
        logging.warn("Failed to format data for grillUpdate broadcast.");
    }
  });
}

// --- API Endpoints ---
// Health check endpoint
app.get('/health', (req, res) => {
    if (manager && manager.isReady()) {
        res.status(200).json({ status: 'OK', message: 'Manager initialized.', mqttConnected: manager.isConnected() });
    } else {
        res.status(503).json({ status: 'Initializing', message: 'Manager not ready.' });
    }
});

// Optional: Endpoint to get current state via HTTP (useful for debugging/initial load)
app.get('/api/grill-data', (req, res) => {
  const requestId = `req-${Date.now().toString(36)}`;
  logging.debug(`[${requestId}] Received request for GET /api/grill-data`);
  if (!manager || !manager.isReady()) {
    return res.status(503).json({ error: 'Service Unavailable: Manager initializing.' });
  }
  try {
    const grills = manager.api?.grills;
    if (grills && grills.length > 0) {
      const formattedData = formatGrillData(grills[0]);
      if (formattedData) {
        res.status(200).json(formattedData);
      } else {
         res.status(500).json({ error: 'Internal Server Error: Could not format data.' });
      }
    } else {
      res.status(404).json({ error: 'Not Found: No grill data.' });
    }
  } catch (error) {
    logging.error(`[${requestId}] Error in GET /api/grill-data:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Server Initialization and Start ---
async function startServer() {
  let serverInstance;
  try {
    logging.log("Attempting to initialize the Traeger Manager...");
    await manager.initialize();
    logging.log("Manager initialization successful.");

    // Listen using the httpServer which has Socket.IO attached
    serverInstance = httpServer.listen(PORT, () => {
      logging.log(`Server (HTTP + WebSocket) running on http://localhost:${PORT}`);
      logging.log(`CORS allows connections from specified origins.`);
      logging.log('Server ready...');
    });

    serverInstance.on('error', (error) => {
        logging.error('FATAL: HTTP server failed to start listening:', error);
        process.exit(1);
    });

  } catch (error) {
    logging.error("FATAL: Failed to initialize Manager or start server:", error);
    process.exit(1);
  }

  // --- Graceful Shutdown Handling ---
  const shutdown = async (signal) => {
    logging.warn(`Received ${signal}. Starting graceful shutdown...`);
    io.close((ioErr) => { // Close Socket.IO first
        if (ioErr) logging.error('Error closing Socket.IO:', ioErr);
        else logging.log('Socket.IO connections closed.');

        if (serverInstance) { // Close HTTP server
          serverInstance.close(async () => {
             logging.log('HTTP server closed.');
             if (manager) { // Shutdown Manager
                 logging.log('Shutting down the Manager...');
                 await manager.shutdown();
             }
             logging.log('Graceful shutdown complete. Exiting.');
             process.exit(0); // Exit cleanly
          });
        } else { process.exit(0); } // Exit if server wasn't listening
    });
    // Force exit after timeout
    setTimeout(() => {
      logging.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// --- Start the application ---
startServer();