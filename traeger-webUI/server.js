import express from 'express';
import cors from 'cors';
import Manager from './utils/manager.js'; // Ensure path is correct
import dotenv from 'dotenv';

// --- Basic Setup & Logging ---
dotenv.config();
const logging = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: process.env.NODE_ENV !== 'production' ? console.debug : () => {},
};

// Log current time at startup for reference (using date from context)
logging.log(`Server process starting at: ${new Date('2025-04-02T18:11:19-07:00').toISOString()}`); // Wednesday, April 2, 2025 at 6:11:19 PM PDT

// --- Configuration and Validation ---
const { TRAEGER_USERNAME, TRAEGER_PASSWORD, PORT = 3001 } = process.env;

if (!TRAEGER_USERNAME || !TRAEGER_PASSWORD) {
  logging.error('FATAL: Missing required environment variables (TRAEGER_USERNAME, TRAEGER_PASSWORD)');
  process.exit(1);
}

// --- CORS Configuration ---
// Recommended: List specific origins allowed to connect to your server.
const allowedOrigins = [
    'http://localhost:3000', // Example: Local React dev server
    'http://127.0.0.1:3000',
    // Add the URL of your deployed frontend application here
    // 'https://your-frontend-app.com'
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    // Allow specified origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      const msg = `CORS policy does not allow access from origin: ${origin}`;
      logging.warn(msg);
      return callback(new Error(msg), false);
    }
  },
  methods: "GET", // Only allow GET requests to this server for now
  // credentials: true // Uncomment if you need cookies/authorization headers from frontend
};

// --- Express App Setup ---
const app = express();
// Apply CORS middleware *before* routes
app.use(cors(corsOptions));
// Middleware to parse JSON bodies (though not strictly needed for GET-only)
app.use(express.json());

// --- Manager Instance ---
// Instantiate the manager; initialization happens asynchronously in startServer()
let manager;
try {
    // Manager constructor is synchronous
    manager = new Manager(TRAEGER_USERNAME, TRAEGER_PASSWORD);
} catch(error) {
    // Catch synchronous errors from Manager constructor (e.g., missing credentials if check was there)
    logging.error("FATAL: Failed to instantiate Manager:", error);
    process.exit(1);
}


// --- Helper Function (Data Formatting for API Response) ---
/**
 * Formats the raw grill data from the Grill object into the desired API response structure.
 * @param {Grill} grill - The Grill instance from manager.api.grills.
 * @returns {object|null} Formatted data object or null if formatting fails.
 */
function formatGrillData(grill) {
    // Ensure we have a valid grill object and its data property
    if (!grill || typeof grill.data !== 'object') {
      logging.warn('formatGrillData received invalid grill object:', grill);
      return null;
    }

    // Safely access nested properties using optional chaining (?.) and nullish coalescing (??)
    const details = grill.data.details ?? {};
    const status = grill.data.status ?? {};

    // Determine the 'connected' status based on Manager's view
    // Requires Manager instance to be accessible in this scope
    const isConsideredConnected = manager ? (manager.isGrillConsideredOnline && manager.isConnected()) : false;

    return {
      // Grill Details
      grillName: details.friendlyName ?? 'GRILL NAME',

      // Temperatures
      currentTemp: status.grill ?? 0,
      setTemp: status.set ?? 0,
      probeTemp: status.probe ?? 0,
      // Add other temperatures if available, e.g., probe set temp
      // probeSetTemp: status.probe_set_temp ?? 0,

      // Status & Metadata
      // Use the combined status from Manager for a user-friendly 'connected' field
      connected: isConsideredConnected,
      // Raw status flags (optional, for debugging)
      // _rawApiConnected: status.connected ?? false, // From the last API/MQTT data packet
      // _rawManagerApiView: manager?.isGrillConsideredOnline ?? false, // Manager's view based on API checks
      // _rawManagerMqttView: manager?.isMqttConnected ?? false, // Manager's view based on MQTT events

      systemStatus: status.system_status ?? 99, // Traeger system status code
      // Add other relevant status fields if needed (e.g., pellet level, timers)
      // pelletLevel: status.pellet_level ?? null,
      // activeTimer: status.active_timer ?? null,

      // Timestamp of the data generation
      time: new Date().toISOString(),
      // Timestamp of the last data update received by the Grill object
      lastGrillUpdate: grill.lastUpdate ? new Date(grill.lastUpdate).toISOString() : null,
    };
}


// --- API Endpoints ---

/**
 * Health check endpoint. Indicates if the manager is initialized and ready.
 */
app.get('/health', (req, res) => {
    if (manager && manager.isReady()) {
        res.status(200).json({
             status: 'OK',
             message: 'Service is up and manager is initialized.',
             // Optionally include MQTT connection status
             mqttConnected: manager.isConnected(),
             grillConsideredOnline: manager.isGrillConsideredOnline,
        });
    } else {
        res.status(503).json({
            status: 'Initializing',
            message: 'Service is starting, manager is not ready yet.'
        });
    }
});

/**
 * Main endpoint to get formatted data for the primary grill.
 */
app.get('/api/grill-data', async (req, res) => {
  const requestId = `req-${Date.now().toString(36)}`; // Simple request ID
  logging.debug(`[${requestId}] Received request for /api/grill-data`);

  // 1. Check if Manager is initialized and ready
  if (!manager || !manager.isReady()) {
    logging.warn(`[${requestId}] Manager not ready, returning 503 Service Unavailable.`);
    // Add Retry-After header if desired
    // res.setHeader('Retry-After', '30'); // Suggest client tries again in 30 seconds
    return res.status(503).json({ error: 'Service Unavailable: The backend service is initializing. Please try again shortly.' });
  }

  try {
    // 2. Access the cached grill data from the Manager
    //    Data is updated in the background by Manager's polling/MQTT.
    const grills = manager.api?.grills; // Access cached Grill instances

    if (grills && grills.length > 0) {
      // Assuming the first grill is the primary one
      const primaryGrill = grills[0];

      // Log raw data for debugging if needed (use debug level)
      // logging.debug(`[${requestId}] Raw data for ${primaryGrill.identifier}:`, primaryGrill.data);

      // 3. Format the data for the API response
      const formattedData = formatGrillData(primaryGrill);

      if (formattedData) {
        logging.debug(`[${requestId}] Sending formatted grill data for ${formattedData.grillName}`);
        res.status(200).json(formattedData);
      } else {
         // This might occur if the grill object exists but formatting failed
         logging.error(`[${requestId}] Failed to format data for grill: ${primaryGrill?.identifier}`);
         res.status(500).json({ error: 'Internal Server Error: Could not format grill data.' });
      }

    } else {
      // This case should be rare if manager.isReady() is true, but handle defensively
      logging.warn(`[${requestId}] Manager is ready, but no grills found in its cache.`);
      res.status(404).json({ error: 'Not Found: No grill data available.' });
    }
  } catch (error) {
    // Catch unexpected errors in the handler logic
    logging.error(`[${requestId}] Unexpected error in /api/grill-data handler:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// --- Server Initialization and Start ---

/**
 * Initializes the Manager and starts the Express server.
 * Includes graceful shutdown handling.
 */
async function startServer() {
  let serverInstance; // To hold the reference returned by app.listen

  try {
    logging.log("Attempting to initialize the Traeger Manager...");
    // Wait for the manager's asynchronous initialization to complete
    await manager.initialize();
    logging.log("Manager initialization successful.");

    // Start the Express server only after the manager is ready
    serverInstance = app.listen(PORT, () => {
      logging.log(`Express server running on http://localhost:${PORT}`);
      logging.log(`CORS configuration: Allowed origins vary (check code/logs).`); // Be cautious logging allowedOrigins directly if sensitive
      logging.log('Server ready and waiting for requests...');
    });

    // Handle potential errors during server listening setup
    serverInstance.on('error', (error) => {
        logging.error('FATAL: Express server failed to start listening:', error);
        process.exit(1);
    });

  } catch (error) {
    // Catch errors specifically from manager.initialize()
    logging.error("FATAL: Failed to initialize Manager:", error);
    process.exit(1); // Exit if manager initialization fails critically
  }

  // --- Graceful Shutdown Handling ---
  const shutdown = async (signal) => {
    logging.warn(`Received ${signal}. Starting graceful shutdown...`);

    // Stop the HTTP server from accepting new connections
    if (serverInstance) {
      serverInstance.close(async () => {
        logging.log('HTTP server closed (no new connections).');

        // Now, shut down the manager (disconnect MQTT, clear timers)
        if (manager) {
          logging.log('Shutting down the Manager...');
          await manager.shutdown(); // Call the manager's async shutdown
        }

        // Optionally, close other resources like database connections here

        logging.log('Graceful shutdown complete. Exiting.');
        process.exit(0); // Exit cleanly
      });
    } else {
        // If serverInstance isn't set (startup failed), just exit
        logging.warn("Shutdown called but server was not listening. Exiting.");
        process.exit(0);
    }


    // Force exit after a timeout if graceful shutdown hangs
    setTimeout(() => {
      logging.error('Graceful shutdown timed out after 10 seconds. Forcing exit.');
      process.exit(1); // Exit with error code
    }, 10000); // 10 seconds timeout
  };

  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM')); // Standard signal for termination (e.g., from Docker, systemd)
  process.on('SIGINT', () => shutdown('SIGINT'));   // Signal for Ctrl+C in terminal

}

// --- Start the application ---
startServer();