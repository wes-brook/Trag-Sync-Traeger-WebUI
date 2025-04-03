import { io } from 'socket.io-client';
import { ref } from 'vue'; // Import ref for reactive status

// Define server URL (use environment variables for production)
const SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
// For production build using Render/etc., set VITE_SOCKET_URL
// const SERVER_URL = 'https://traeger-webui-backend.onrender.com';

export const isConnected = ref(false); // Reactive connection status
export const socket = io(SERVER_URL, {
    autoConnect: true, // Automatically connect
    reconnectionAttempts: 5, // Number of attempts before giving up
    reconnectionDelay: 3000, // Delay between attempts (ms)
});

console.log(`Attempting to connect socket to: ${SERVER_URL}`);

socket.on('connect', () => {
  console.log('Socket connected successfully:', socket.id);
  isConnected.value = true;
});

socket.on('disconnect', (reason) => {
  console.warn('Socket disconnected:', reason);
  isConnected.value = false;
  // Handle disconnect reasons if needed (e.g., 'io server disconnect')
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message, err.cause);
  isConnected.value = false;
  // Optionally alert user or try specific recovery
});

// Add methods here to explicitly connect/disconnect if needed,
// but autoConnect handles basic cases.
// export const connectSocket = () => socket.connect();
// export const disconnectSocket = () => socket.disconnect();

// Note: Components will import 'socket' and 'isConnected' from this file.
// Components are responsible for adding/removing their specific event listeners.