import Mqtt from './mqtt.js';
import Api from './api.js';
import { EventEmitter } from 'events'; // Import EventEmitter

// Use a structured logger
const logging = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: process.env.NODE_ENV !== 'production' ? console.debug : () => {},
};

// Make Manager inherit from EventEmitter
class Manager extends EventEmitter {
  constructor(
    username = '',
    password = '',
    intervalIdle = 60 * 5, // Default 5 minutes
    intervalBusy = 10 // Default 10 seconds
  ) {
    super(); // Call super() for EventEmitter constructor
    this.api = new Api(username, password, intervalIdle, intervalBusy);
    this.mqttClient = null;
    this.healthCheckIntervalMs = 20 * 1000; // Check every 20 seconds
    this.apiPollingLoops = [];
    this.healthCheckTimeoutId = null;

    // State Flags
    this.isInitialized = false;
    this.isInitializing = false;
    this.isGrillConsideredOnline = false; // Tracks API view
    this.isMqttConnected = false; // Tracks MQTT connection
    this.isInSleepMode = false; // Pauses activity based on API view
  }

  /**
   * Initializes the API connection, fetches MQTT endpoint and initial grill data,
   * starts MQTT connection attempt, polling loops, and health checks.
   */
  async initialize() {
    if (this.isInitialized || this.isInitializing) {
      logging.warn('Manager initialization already complete or in progress.');
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      return;
    }

    this.isInitializing = true;
    logging.log('Manager initialization started...');

    try {
      // 1. Initialize API (auth, get grills, initial update)
      await this.api.init();
      if (!this.api.grills || this.api.grills.length === 0) {
        throw new Error('API initialized, but no grills found.');
      }
      logging.log(`Found ${this.api.grills.length} grill(s).`);
      const primaryGrill = this.api.grills[0];
      logging.log(`Primary grill identifier: ${primaryGrill.identifier}`);

      // 1a. Fetch MQTT Endpoint URL
      let mqttEndpointAvailable = false;
      try {
          logging.log("Fetching MQTT endpoint from API...");
          await this.api.getMqttEndpoint();
          if (this.api.mqttEndpoint) {
               logging.log("MQTT endpoint fetched successfully.");
               mqttEndpointAvailable = true;
          } else {
               throw new Error("API call succeeded but MQTT endpoint is still null.");
          }
      } catch (mqttEndpointError) {
          logging.error(`Failed to fetch MQTT endpoint: ${mqttEndpointError.message}`);
          logging.warn("Proceeding without MQTT functionality.");
          this.api.mqttEndpoint = null;
          mqttEndpointAvailable = false;
      }

      // 2. Initial Grill Status Check
      try {
           await this.checkAndUpdateGrillStatus(primaryGrill.identifier);
           logging.log(`Initial API status check complete. Grill considered online: ${this.isGrillConsideredOnline}`);
      } catch (initialCheckError) {
           logging.warn(`Initial checkAndUpdateGrillStatus failed: ${initialCheckError.message}`);
           this.isGrillConsideredOnline = false;
      }

      // 3. Initialize & Attempt MQTT Connection (Optimistic, if endpoint available)
      if (mqttEndpointAvailable) {
          logging.log('Attempting MQTT initialization and connection...');
          try {
              this.initializeMqttClient();
              if (this.mqttClient) {
                  await this.connectMqtt(); // Attempt connection
              } else {
                  logging.error("MQTT client initialization failed unexpectedly after endpoint check.");
                  this.isMqttConnected = false;
              }
          } catch (mqttInitConnectError) {
              logging.error(`Error during MQTT setup/connection: ${mqttInitConnectError.message}`);
              this.isMqttConnected = false;
          }
      } else {
           logging.warn("Skipping MQTT initialization because endpoint was not available.");
           this.isMqttConnected = false;
           this.isInSleepMode = !this.isGrillConsideredOnline; // Enter sleep if MQTT unavailable & initial check was offline
           if(this.isInSleepMode) logging.log("Entering sleep mode as MQTT is unavailable and initial check was offline.");
      }

      // 4. Start API polling loops
      this.startApiPollingLoops();

      // 5. Start the health check loop
      this.startHealthCheckLoop();

      this.isInitialized = true;
      logging.log('Manager initialization complete.');

    } catch (error) {
      logging.error('Manager initialization failed:', error);
      await this.shutdown();
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /** Provides the current readiness state of the manager. */
  isReady() {
    return this.isInitialized;
  }

  /** Provides the current MQTT connection state based on events. */
  isConnected() {
    return this.isMqttConnected;
  }

  /** Gracefully shuts down the manager. */
  async shutdown() {
    logging.log('Manager shutdown initiated...');
    this.isInitialized = false;

    if (this.healthCheckTimeoutId) {
      clearTimeout(this.healthCheckTimeoutId);
      this.healthCheckTimeoutId = null;
      logging.log('Health check loop stopped.');
    }

    logging.warn('API polling loops termination not fully implemented for shutdown.');
    this.apiPollingLoops = [];

    await this.disconnectMqtt(); // Disconnect MQTT

    logging.log('Manager shutdown complete.');
  }

  /** Checks API for grill status, updates state, manages sleep mode entry/exit. */
  async checkAndUpdateGrillStatus(grillIdentifier) {
    let isCurrentlyOnline = false;
    try {
        await this.api.updateGrill(grillIdentifier); // pushes data to grill obj
        const grill = this.api.getGrillById(grillIdentifier);
        isCurrentlyOnline = grill?.isOn ?? false; // Rely on state within Grill obj
        logging.debug(`Health check: Grill API status check result: ${isCurrentlyOnline ? 'Online' : 'Offline'}`);
    } catch (error) {
        logging.error(`Error during API grill status check for ${grillIdentifier}:`, error.message);
        isCurrentlyOnline = false;
    }

    // State Change Logic based on API Check
    if (this.isGrillConsideredOnline !== isCurrentlyOnline) {
       logging.log(`Grill online status changed via API check: ${isCurrentlyOnline}`);
       this.isGrillConsideredOnline = isCurrentlyOnline;
       if (isCurrentlyOnline && this.isInSleepMode) {
           logging.log('Grill back online (API). Exiting sleep mode.');
           this.isInSleepMode = false;
           if (!this.isMqttConnected) {
               logging.log("Attempting MQTT connection on exiting sleep mode.");
               if (!this.mqttClient) this.initializeMqttClient(); // Init if needed
               if (this.mqttClient) await this.connectMqtt(); // Then connect
           }
       } else if (!isCurrentlyOnline && !this.isInSleepMode) {
           logging.log('Grill offline (API). Entering sleep mode.');
           this.isInSleepMode = true;
           // Optional: await this.disconnectMqtt();
       }
    }
    return isCurrentlyOnline;
  }

  /** Sets up the MQTT client instance and attaches event listeners. */
  initializeMqttClient() {
     if (this.mqttClient) {
        logging.warn("MQTT Client already exists. Disconnecting old one before creating new.");
        this.mqttClient.removeAllListeners();
        this.mqttClient.disconnect().catch(e => logging.error("Error disconnecting old MQTT client during re-initialization", e));
     }
    logging.log('Initializing MQTT client instance...');
    try {
        const endpoint = this.api.mqttEndpoint; // Get pre-fetched endpoint
        const grillIdentifiers = this.api.grills?.map((grill) => grill.identifier);

        if (!endpoint || !grillIdentifiers || grillIdentifiers.length === 0) {
            throw new Error("MQTT Initialization Precondition Failed: Endpoint or grills unexpectedly missing.");
        }
        this.mqttClient = new Mqtt(endpoint, grillIdentifiers);
        this.mqttClient.setDataHook(this.mqttEventDispatcher.bind(this));
        this.attachMqttListeners(); // Attach event listeners
    } catch (error) {
        logging.error("Failed to initialize MQTT client instance:", error);
        this.mqttClient = null;
        this.isMqttConnected = false;
    }
  }

  /** Helper to attach MQTT event listeners */
  attachMqttListeners() {
      if (!this.mqttClient) return;
      this.mqttClient.on('connect', () => {
          logging.log('Manager received MQTT connect event.');
          this.isMqttConnected = true;
      });
      this.mqttClient.on('close', () => {
          logging.warn('Manager received MQTT close event.');
          this.isMqttConnected = false;
      });
      this.mqttClient.on('error', (err) => {
          logging.error('Manager received MQTT error event:', err.message);
          this.isMqttConnected = false;
      });
       this.mqttClient.on('offline', () => {
          logging.warn('Manager received MQTT offline event.');
       });
  }

  /** Attempts to connect the MQTT client. */
  async connectMqtt() {
    if (!this.mqttClient) {
      logging.error("Cannot connect MQTT: Client not initialized.");
      return;
    }
    try {
        logging.log("Manager requesting MQTT connection...");
        await this.mqttClient.connect();
        logging.log("Manager: MQTT connect() request finished (event listener confirms state).");
    } catch (error) {
        logging.error(`Manager: MQTT connection attempt failed: ${error.message}`);
    }
  }

  /** Disconnects the MQTT client. */
  async disconnectMqtt() {
    if (this.mqttClient) {
        logging.log("Manager requesting MQTT disconnection...");
        try {
            await this.mqttClient.disconnect();
            logging.log("Manager: MQTT disconnect() request finished (event listener confirms state).");
        } catch(error) {
            logging.error(`Manager: MQTT disconnection attempt threw an unexpected error: ${error}`);
        }
        this.isMqttConnected = false; // Ensure state is false after disconnect call
        // Setting this.mqttClient = null might be better done in initializeMqttClient
    } else {
        logging.debug("Manager: MQTT disconnect requested but no client instance exists.");
        this.isMqttConnected = false;
    }
  }

  /** Health check loop using setTimeout */
  startHealthCheckLoop() {
    logging.log('Starting health check loop.');
    const loop = async () => {
      if (!this.isInitialized && !this.isInitializing) {
          logging.warn("Manager not ready, skipping health check iteration.");
          this.healthCheckTimeoutId = setTimeout(loop, this.healthCheckIntervalMs);
          return;
      }
      logging.debug('Running health check iteration...');
      try {
        // 1. Always check API status
        const grillIsOnlineNow = await this.checkAndUpdateGrillStatus(this.api.grills[0].identifier);

        // 2. If API says grill is ONLINE, ensure MQTT is connected
        if (grillIsOnlineNow && !this.isInSleepMode) {
          if (!this.mqttClient) {
              logging.warn("Health Check: Grill online (API), but MQTT client not initialized! Initializing...");
              this.initializeMqttClient();
              if(this.mqttClient) await this.connectMqtt();
          } else if (!this.isMqttConnected) {
            logging.warn('Health Check: Grill online (API), but MQTT disconnected. Requesting connection...');
            await this.connectMqtt(); // Try to connect
          } else {
             logging.debug("Health Check: Grill online (API) and MQTT connected.");
          }
        } else if (this.isInSleepMode) {
             logging.debug("Health Check: Manager is in sleep mode (grill offline via API).");
        }
      } catch (error) {
        logging.error('Error during health check loop iteration:', error.message);
      } finally {
         if (this.healthCheckTimeoutId !== null) {
             this.healthCheckTimeoutId = setTimeout(loop, this.healthCheckIntervalMs);
         } else {
             logging.log("Health check loop stopping due to manager shutdown.");
         }
      }
    };
    if (this.healthCheckTimeoutId) clearTimeout(this.healthCheckTimeoutId);
    this.healthCheckTimeoutId = setTimeout(loop, this.healthCheckIntervalMs); // Start after initial delay
  }

  /** Starts the background API polling loops */
  startApiPollingLoops() {
    logging.log('Starting API polling loops...');
    this.apiPollingLoops = this.api.grills.map(grill => {
      this.pollUpdates(grill.identifier, this.api); // Run async, don't await
      return { identifier: grill.identifier }; // Return minimal info if needed later
    });
  }

  /** Distributes incoming MQTT data and emits 'grillUpdate' event */
  mqttEventDispatcher(topic, data, grillId) {
    if (this.isInSleepMode) {
        logging.debug(`Ignoring MQTT message on ${topic} while in sleep mode.`);
        return;
    }
    if (!grillId) {
        logging.warn(`MQTT dispatcher called without grillId for topic: ${topic}`);
        return;
    }
    logging.debug(`MQTT message received for grill ${grillId} on topic: ${topic}`);
    const grill = this.api.getGrillById(grillId);
    if (grill) {
      try {
        grill.pushData(data); // Update grill object state
        logging.debug(`Dispatched MQTT data to grill ${grill.identifier}. Current grill.isOn state: ${grill.isOn}`);
        // *** EMIT UPDATE EVENT ***
        this.emit('grillUpdate', grill); // Notify server about the update
        // ... (optional consistency checks) ...
      } catch (e) {
        logging.error(`Error pushing MQTT data to grill ${grillId}:`, e);
      }
    } else {
      logging.warn(`Manager received MQTT data for unknown/stale grill ID: ${grillId}`);
    }
  }

  /** Polling loop for a single grill using the API AND emits 'grillUpdate' event */
  async pollUpdates(grillIdentifier, parentApi) {
    logging.log(`Starting API polling loop for grill ${grillIdentifier}`);
    let shouldContinue = true;
    while (shouldContinue && this.isInitialized) {
        logging.debug(`[${grillIdentifier}] Poll loop TOP - Iteration start.`);
        let intervalSeconds = parentApi.intervalIdle;
        let grillObject = null;
        try {
            grillObject = parentApi.getGrillById(grillIdentifier);
            if (grillObject) {
                intervalSeconds = grillObject.isOn ? parentApi.intervalBusy : parentApi.intervalIdle;
                logging.debug(`[${grillIdentifier}] Polling API... Interval: ${intervalSeconds}s (Grill isOn: ${grillObject.isOn})`);
                await parentApi.updateGrill(grillIdentifier); // updateGrill pushes data
                logging.debug(`[${grillIdentifier}] API poll command completed.`);
                // *** EMIT UPDATE EVENT *** (after successful API poll)
                const updatedGrill = parentApi.getGrillById(grillIdentifier); // Re-get in case instance changed? Or assume updateGrill modified object
                if (updatedGrill) {
                   this.emit('grillUpdate', updatedGrill);
                }
            } else {
                logging.warn(`[${grillIdentifier}] Grill object not found in poll loop.`);
                intervalSeconds = parentApi.intervalIdle;
            }
        } catch (exception) {
            logging.error(`[${grillIdentifier}] Error INSIDE pollUpdates loop try block:`, exception.message);
            intervalSeconds = parentApi.intervalIdle;
        }
        logging.debug(`[${grillIdentifier}] Poll loop waiting for ${intervalSeconds}s...`);
        await new Promise((resolve) => setTimeout(resolve, intervalSeconds * 1000));
        logging.debug(`[${grillIdentifier}] Poll loop finished wait.`);
        if (!this.isInitialized) {
           shouldContinue = false;
           logging.debug(`[${grillIdentifier}] Manager no longer initialized, stopping poll loop.`);
        }
    }
    logging.log(`[${grillIdentifier}] Poll loop WHILE condition false or loop exited.`);
  }
}

export default Manager;