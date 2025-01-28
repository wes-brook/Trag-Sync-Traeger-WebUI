const express = require('express');
const axios = require('axios');
const Api = require('./api'); // Import your existing API class

const app = express();
const port = 3000;

app.use(express.json());

// Initialize your Traeger API
const traegerApi = new Api('your-username', 'your-password');

// Middleware to ensure the API is initialized
app.use(async (req, res, next) => {
  if (!traegerApi.cognitoDetails) {
    await traegerApi.init();
  }
  next();
});

// Route to get grills
app.get('/grills', async (req, res) => {
  try {
    await traegerApi.getGrills();
    res.json(traegerApi.grills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to update a specific grill
app.post('/grills/:id/update', async (req, res) => {
  const grillId = req.params.id;
  try {
    await traegerApi.updateGrill(grillId);
    const grill = traegerApi.grills.find(g => g.identifier === grillId);
    res.json(grill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get MQTT endpoint
app.get('/mqtt-endpoint', async (req, res) => {
  try {
    const endpoint = await traegerApi.getMqttEndpoint();
    res.json({ endpoint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});