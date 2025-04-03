import mqtt from 'mqtt';
import url from 'url';
import { EventEmitter } from 'events'; // Use Node's built-in EventEmitter

// Use a structured logger
const logging = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    debug: process.env.NODE_ENV !== 'production' ? console.debug : () => {},
};

// Default connection options
const DEFAULT_MQTT_OPTIONS = {
  port: 443, // WSS typically uses 443
  protocol: 'wss', // Assuming WebSocket Secure
  rejectUnauthorized: false, // Often required for AWS IoT without custom CA chain handling
  // Note: `reconnectPeriod: 0` disables automatic reconnect by the library.
  // We let Manager handle reconnect logic via health checks for more control.
  reconnectPeriod: 0,
  connectTimeout: 15 * 1000, // 15 seconds connection timeout
  // Keepalive interval (in seconds). Sends PINGREQ if no other packets sent.
  // Helps detect silent disconnections faster than TCP timeouts.
  keepalive: 60,
  // Clean session ensures subscriptions are removed on disconnect.
  // Set to false if you need durable sessions (requires broker support and client ID).
  clean: true,
};

class Mqtt extends EventEmitter {
  constructor(connectString, grills) {
    super(); // Initialize EventEmitter

    if (!connectString) throw new Error('MQTT connectString is required.');
    if (!grills || !Array.isArray(grills) || grills.length === 0) {
      throw new Error('MQTT grills array is required and must not be empty.');
    }

    this.connectString = connectString;
    this.grills = grills; // Array of grill identifiers
    this.client = null; // Holds the mqtt.js client instance
    this.dataHook = null; // Callback for message data (set by Manager)
    this.isConnecting = false; // Flag to prevent concurrent connect attempts
    this.isConnected = false; // Internal connection state tracker
  }

  /** Sets the callback function for processing incoming messages. */
  setDataHook(hook) {
    if (typeof hook === 'function') {
      this.dataHook = hook;
    } else {
      throw new Error("Data hook must be a function.");
    }
  }

  /**
   * Initializes and attempts to connect the MQTT client.
   * Returns a Promise that resolves on successful connection or rejects on failure.
   */
  async connect() {
    if (this.client && this.isConnected) {
      logging.debug('MQTT connect() called but already connected.');
      return Promise.resolve(); // Already connected
    }
    if (this.isConnecting) {
       logging.debug('MQTT connect() called while already connecting.');
       // Could return a promise that waits for the ongoing connection attempt
       return Promise.reject(new Error("Connection attempt already in progress."));
    }

    logging.log('Attempting to connect MQTT client...');
    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        // Ensure any previous client is properly ended before creating a new one
        if (this.client) {
          logging.warn("Existing MQTT client found during connect(). Ending previous instance.");
          this.client.end(true); // End immediately, discard offline queue
          this.client.removeAllListeners(); // Clean up listeners
        }

        const mqttUrl = url.parse(this.connectString); // Parse the signed URL
        const options = {
          ...DEFAULT_MQTT_OPTIONS,
          host: mqttUrl.hostname,
          path: mqttUrl.path, // Path from signed URL is crucial for WSS
          hostname: mqttUrl.hostname, // Explicitly set hostname
          clientId: `trag-sync-${Date.now()}`, // Unique client ID for clean sessions
          // Add any specific wsOptions if needed, e.g., headers
          wsOptions: {
             headers: { 'Host': mqttUrl.hostname } // Host header is often necessary for WSS proxies/load balancers
          }
        };

        logging.debug("MQTT Connection Options:", options);
        this.client = mqtt.connect(this.connectString, options);

        // --- Attach Event Listeners ---

        // Success
        this.client.once('connect', (connack) => {
          if (this.isConnecting) { // Check if this connection attempt is still relevant
            logging.log('MQTT client connected successfully.');
            this.isConnected = true;
            this.isConnecting = false;
            this.subscribeToGrills(); // Subscribe after successful connect
            this.emit('connect'); // Notify Manager
            resolve(); // Resolve the promise
          } else {
            // This can happen if disconnect was called while connection was in progress
            logging.warn("MQTT connected, but connection process was cancelled. Disconnecting.");
            this.client.end(true);
            reject(new Error("Connection cancelled"));
          }
        });

        // Failure/Errors
        this.client.once('error', (err) => {
          logging.error(`MQTT client error: ${err.message}`);
          if (this.isConnecting) { // Only reject if error happens during initial connect attempt
            this.isConnecting = false;
            this.isConnected = false; // Ensure state is correct
            this.emit('error', err); // Notify Manager
            this.cleanupClient(); // Attempt to clean up the failed client
            reject(err); // Reject the promise
          } else {
            // If already connected, error might just be informational or lead to 'close'
             this.emit('error', err);
          }
        });

        // Disconnection (expected or unexpected)
        this.client.once('close', () => {
          logging.warn('MQTT client connection closed.');
          const wasConnected = this.isConnected;
          this.isConnected = false;
          this.isConnecting = false; // Ensure connecting flag is reset
          if (wasConnected) {
              this.emit('close'); // Notify Manager only if it was previously connected
          }
          // Reject connect promise if close happens during connection attempt
          // Note: This might race with 'error'. Check isConnecting flag.
          // Typically handled by Manager's health check now, not internal retries.
          this.cleanupClient(); // Ensure client is cleaned up on close
        });

        // Offline event (client buffer full, potentially losing messages)
        this.client.on('offline', () => {
            logging.warn("MQTT client has gone offline (buffer full or connection lost).");
             this.emit('offline');
        });

         // Message Reception
        this.client.on('message', (topic, payload) => {
          this.handleMessage(topic, payload);
        });

      } catch (error) {
        // Catch synchronous errors during setup
        logging.error("Error initializing MQTT client:", error);
        this.isConnecting = false;
        this.cleanupClient();
        reject(error);
      }
    });
  }

  /** Subscribes to the necessary topics for all grills. */
  subscribeToGrills() {
    if (!this.client || !this.isConnected) {
      logging.warn('Cannot subscribe: MQTT client not connected.');
      return;
    }
    logging.debug(`Subscribing to topics for ${this.grills.length} grills...`);
    for (const grillIdentifier of this.grills) {
      const topic = `prod/thing/update/${grillIdentifier}`;
      this.client.subscribe(topic, { qos: 1 }, (err, granted) => {
        if (err) {
          logging.error(`Failed to subscribe to topic ${topic}:`, err);
          this.emit('error', new Error(`Subscription failed for ${topic}`));
        } else {
          logging.debug(`Successfully subscribed to topic: ${granted[0]?.topic ?? topic} with QoS ${granted[0]?.qos ?? 'N/A'}`);
        }
      });
    }
  }

  /** Handles incoming messages and calls the dataHook. */
  handleMessage(topic, payload) {
    logging.debug(`MQTT message received on topic: ${topic}`);
    try {
      const messageString = payload.toString();
      // Handle potential empty payloads which can occur
      if (!messageString) {
         logging.debug(`Received empty payload on topic: ${topic}`);
         return;
      }
      const data = JSON.parse(messageString);

      if (this.dataHook) {
        // Find which grill this message is for (simple includes check)
        const grillId = this.grills.find(id => topic.includes(id));
        if (grillId) {
            this.dataHook(topic, data, grillId); // Pass grillId for context if needed
        } else {
             logging.warn(`Received message on topic ${topic} but couldn't match to a known grill.`);
        }
      } else {
        logging.warn('Received MQTT message but no dataHook is set.');
      }
    } catch (err) {
      logging.error(`Error processing MQTT message on topic ${topic}:`, err);
      logging.error(`Raw payload: ${payload.toString()}`);
      this.emit('error', new Error(`Failed to parse message on ${topic}`));
    }
  }


  /** Gracefully disconnects the MQTT client. */
  async disconnect() {
    if (!this.client) {
      logging.debug('MQTT disconnect() called but client does not exist.');
      this.isConnected = false; // Ensure state consistency
      this.isConnecting = false;
      return Promise.resolve();
    }
    if (!this.isConnected && !this.isConnecting) {
        logging.debug('MQTT disconnect() called but client is already disconnected.');
        this.cleanupClient(); // Ensure cleanup happens
        return Promise.resolve();
    }

    logging.log('Disconnecting MQTT client...');
    // Set flags immediately to prevent race conditions
    this.isConnecting = false;
    this.isConnected = false;


    return new Promise((resolve) => {
      // Use end() for graceful disconnect. Pass true to force close immediately.
      // Pass false (or nothing) to allow offline queue processing first (if configured).
      this.client.end(true, {}, () => {
        logging.log('MQTT client disconnected via end().');
        this.cleanupClient(); // Perform final cleanup
        resolve(); // Resolve the promise after end callback
      });

      // Timeout for disconnect in case 'end' callback doesn't fire
      const timeoutId = setTimeout(() => {
          logging.warn("MQTT disconnect timed out. Forcing cleanup.");
          this.cleanupClient();
          resolve(); // Resolve anyway after timeout
      }, 5000); // 5 second timeout

      // Clear timeout if end() finishes quickly
       this.client.once('end', () => clearTimeout(timeoutId)); // 'end' might fire before callback sometimes
       this.client.once('close', () => clearTimeout(timeoutId)); // 'close' might also signal completion

    });
  }

  /** Cleans up the client instance and listeners. */
  cleanupClient() {
     if (this.client) {
         this.client.removeAllListeners();
         // Setting to null helps garbage collection and indicates no active client
         this.client = null;
         logging.debug("MQTT client instance cleaned up.");
     }
     // Reset state flags
     this.isConnected = false;
     this.isConnecting = false;
  }

}

export default Mqtt;