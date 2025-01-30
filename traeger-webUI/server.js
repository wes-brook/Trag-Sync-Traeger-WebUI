import express from 'express';
import cors from 'cors';
import Manager from './utils/manager.js'; 
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

const app = express();
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enabling CORS for all routes

// Initialize the Manager instance
const manager = new Manager(process.env.USERNAME_, process.env.PASSWORD_);

// Proxy endpoint to fetch grill data
app.get('/api/grill-data', async (req, res) => {
  try {
    // Wait for the API to initialize
    await manager.waitForApiInitialization();

    // Get the first grill's data
    if (manager.api.grills.length > 0) {
      const grill = manager.api.grills[0];

      // Log the grill data
      console.log('Grill data:', grill.data);

      // Send the grill data back to the frontend
      res.json({
        grillName: grill.data.details?.friendlyName || "GRILL NAME",
        currentTemp: grill.data.status?.grill || 0,
        setTemp: grill.data.status?.set || 0,
        probeTemp: grill.data.status?.probe || 0,
        time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }).replace(/^0/, '')
      ,
      });
    } else {
      res.status(404).json({ error: 'No grills found' });
    }
  } catch (error) {
    console.error('Error fetching grill data:', error);
    res.status(500).json({ error: 'Failed to fetch grill data' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});