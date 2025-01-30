// services/api.js (in your Nuxt 3 project)
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Express server URL
});

export const getGrillData = async () => {
  try {
    const response = await api.get('/grill-data'); // Call the Express endpoint
    return response.data;
  } catch (error) {
    console.error('Error fetching grill data:', error);
    return null;
  }
};