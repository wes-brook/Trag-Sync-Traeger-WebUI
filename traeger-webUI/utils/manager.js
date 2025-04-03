import Mqtt from "./mqtt.js"; // Ensure path is correct
import Api from "./api.js"; // Ensure path is correct

// Use a structured logger (same pattern as other files)
const logging = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: process.env.NODE_ENV !== "production" ? console.debug : () => {},
};

class Manager {
  constructor(
    username = "",
    password = "",
    intervalIdle = 60 * 5, // Default 5 minutes
    intervalBusy = 10 // Default 10 seconds
  ) {
    // Api constructor now throws if username/password missing
    this.api = new Api(username, password, intervalIdle, intervalBusy);

    this.mqttClient = null; // Will hold instance of the new Mqtt class
    this.healthCheckIntervalMs = 20 * 1000; // Check every 20 seconds
    this.apiPollingLoops = []; // Store polling loop handles (conceptual - stopping needs implementation)
    this.healthCheckTimeoutId = null; // Store timeout ID for cleanup

    // State Flags
    this.isInitialized = false; // Overall manager readiness
    this.isInitializing = false; // Prevent concurrent initialization attempts
    this.isGrillConsideredOnline = false; // Tracks if API *thinks* grill should be online
    this.isMqttConnected = false; // Tracks MQTT connection status based on events
    this.isInSleepMode = false; // Tracks if manager activity is paused due to offline grill
  }

  // --- Public Methods ---

  /**
   * Initializes the API connection, fetches initial grill data,
   * starts MQTT, polling loops, and health checks.
   */
  async initialize() {
    if (this.isInitialized || this.isInitializing) {
      logging.warn("Manager initialization already complete or in progress.");
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      return;
    }

    this.isInitializing = true;
    logging.log("Manager initialization started...");

    try {
      // 1. Initialize API (auth, get grills, initial update)
      await this.api.init();
      if (!this.api.grills || this.api.grills.length === 0) {
        throw new Error("API initialized, but no grills found.");
      }
      logging.log(`Found ${this.api.grills.length} grill(s).`);
      const primaryGrill = this.api.grills[0];
      logging.log(`Primary grill identifier: ${primaryGrill.identifier}`);

      // *** === ADD THIS STEP === ***
      // 1a. Fetch MQTT Endpoint URL
      let mqttEndpointAvailable = false;
      try {
        logging.log("Fetching MQTT endpoint from API...");
        // Call the API method to get the signed URL
        await this.api.getMqttEndpoint();
        if (this.api.mqttEndpoint) {
          logging.log("MQTT endpoint fetched successfully.");
          mqttEndpointAvailable = true;
        } else {
          // Should be caught by error below, but double check
          throw new Error("API call succeeded but MQTT endpoint is still null.");
        }
      } catch (mqttEndpointError) {
        logging.error(`Failed to fetch MQTT endpoint: ${mqttEndpointError.message}`);
        logging.warn("Proceeding without MQTT functionality.");
        // Ensure endpoint is null and flag is false
        this.api.mqttEndpoint = null;
        mqttEndpointAvailable = false;
        // Do NOT throw here - allow manager to continue without MQTT if desired
      }
      // *** === END ADDED STEP === ***

      // 2. Initial Grill Status Check
      try {
        await this.checkAndUpdateGrillStatus(primaryGrill.identifier);
        logging.log(`Initial API status check complete. Grill considered online: ${this.isGrillConsideredOnline}`);
      } catch (initialCheckError) {
        logging.warn(`Initial checkAndUpdateGrillStatus failed: ${initialCheckError.message}`);
        this.isGrillConsideredOnline = false;
      }

      // 3. Initialize & Attempt MQTT Connection (Optimistic, BUT only if endpoint exists)
      if (mqttEndpointAvailable) {
        // <<< USE THE FLAG CHECK
        logging.log("Attempting MQTT initialization and connection...");
        try {
          // Pass the fetched endpoint to the MQTT initializer
          this.initializeMqttClient(); // This will read this.api.mqttEndpoint
          if (this.mqttClient) {
            await this.connectMqtt();
          } else {
            // Log error if initializeMqttClient failed silently
            logging.error("MQTT client initialization failed despite endpoint availability.");
            this.isMqttConnected = false; // Ensure state
          }
        } catch (mqttInitConnectError) {
          logging.error(`Error during MQTT setup/connection: ${mqttInitConnectError.message}`);
          this.isMqttConnected = false; // Ensure state
        }
      } else {
        logging.warn("Skipping MQTT initialization because endpoint was not available.");
        this.isMqttConnected = false; // Ensure state
        // Decide initial sleep state if MQTT isn't possible
        this.isInSleepMode = !this.isGrillConsideredOnline;
        if (this.isInSleepMode) logging.log("Entering sleep mode as MQTT is unavailable and initial check was offline.");
      }

      // 4. Start API polling loops
      this.startApiPollingLoops();

      // 5. Start the health check loop
      this.startHealthCheckLoop();

      this.isInitialized = true;
      logging.log("Manager initialization complete.");
    } catch (error) {
      logging.error("Manager initialization failed:", error);
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

  /** Provides the current connection state based on MQTT events. */
  isConnected() {
    // Use the internal flag updated by MQTT events
    return this.isMqttConnected;
  }

  /** Gracefully shuts down the manager. */
  async shutdown() {
    logging.log("Manager shutdown initiated...");
    this.isInitialized = false; // Mark as not ready

    // Clear health check loop
    if (this.healthCheckTimeoutId) {
      clearTimeout(this.healthCheckTimeoutId);
      this.healthCheckTimeoutId = null;
      logging.log("Health check loop stopped.");
    }

    // Stop API polling loops (Needs robust implementation in pollUpdates)
    logging.warn("API polling loops termination not fully implemented for shutdown.");
    // Example: Signal loops to stop
    // this.apiPollingLoops.forEach(loopControl => loopControl.stop());
    this.apiPollingLoops = [];

    // Disconnect MQTT client using the new async method
    await this.disconnectMqtt(); // Ensures proper MQTT shutdown

    logging.log("Manager shutdown complete.");
  }

  // --- Internal Methods ---

  /** Checks API for grill status, updates state, manages sleep mode entry/exit. */
  async checkAndUpdateGrillStatus(grillIdentifier) {
    let isCurrentlyOnline = false;
    try {
      // updateGrill pushes data to the grill object
      await this.api.updateGrill(grillIdentifier);
      const grill = this.api.getGrillById(grillIdentifier);
      // *** Rely on the state set within the Grill object ***
      isCurrentlyOnline = grill?.isOn ?? false;
      logging.debug(`Health check: Grill API status check result: ${isCurrentlyOnline ? "Online" : "Offline"}`);
    } catch (error) {
      logging.error(`Error during API grill status check for ${grillIdentifier}:`, error.message);
      isCurrentlyOnline = false;
    }

    // State change logic remains the same - manages isInSleepMode based on this check
    if (this.isGrillConsideredOnline !== isCurrentlyOnline) {
      // ... (keep existing logic for managing isInSleepMode) ...
      logging.log(`Grill online status changed via API check: ${isCurrentlyOnline}`);
      this.isGrillConsideredOnline = isCurrentlyOnline;
      // ... (logic to exit/enter sleep mode, potentially trigger MQTT connect on exit) ...
      if (isCurrentlyOnline && this.isInSleepMode) {
        logging.log("Grill back online (API). Exiting sleep mode.");
        this.isInSleepMode = false;
        if (!this.isMqttConnected) {
          // Check MQTT status flag
          logging.log("Attempting MQTT connection on exiting sleep mode.");
          // Re-initialize client only if necessary? Or just connect? Assume connect is enough if client exists.
          if (!this.mqttClient) this.initializeMqttClient();
          if (this.mqttClient) await this.connectMqtt();
        }
      } else if (!isCurrentlyOnline && !this.isInSleepMode) {
        logging.log("Grill offline (API). Entering sleep mode.");
        this.isInSleepMode = true;
        // Optionally disconnect MQTT immediately if desired
        // await this.disconnectMqtt();
      }
    }
    return isCurrentlyOnline;
  }

  /** Sets up the MQTT client instance and attaches event listeners. Does NOT connect. */
  initializeMqttClient() {
    if (this.mqttClient) {
      // Still good practice to clean up old one if re-initializing
      logging.warn("MQTT Client already initialized. Disconnecting old one before creating new.");
      this.mqttClient.removeAllListeners();
      this.mqttClient.disconnect().catch((e) => logging.error("Error disconnecting old MQTT client during re-initialization", e));
    }

    logging.log("Initializing MQTT client instance...");
    try {
      // Get the endpoint and identifiers PREVIOUSLY fetched/validated by initialize()
      const endpoint = this.api.mqttEndpoint;
      const grillIdentifiers = this.api.grills?.map((grill) => grill.identifier); // Add safe navigation

      // Simplified check - rely on initialize() having done the heavy lifting
      if (!endpoint || !grillIdentifiers || grillIdentifiers.length === 0) {
        // This indicates a logic error elsewhere if initialize() didn't prevent this call
        throw new Error("MQTT Initialization Precondition Failed: Endpoint or grills unexpectedly missing.");
      }

      this.mqttClient = new Mqtt(endpoint, grillIdentifiers);
      this.mqttClient.setDataHook(this.mqttEventDispatcher.bind(this));
      this.attachMqttListeners(); // Use helper to attach listeners
    } catch (error) {
      logging.error("Failed to initialize MQTT client instance:", error);
      this.mqttClient = null; // Ensure null on failure
      this.isMqttConnected = false;
      // Do not re-throw here, allow manager to potentially run without MQTT
    }
  }

  // Ensure attachMqttListeners helper exists (from previous thought process)
  attachMqttListeners() {
    if (!this.mqttClient) return;
    this.mqttClient.on("connect", () => {
      logging.log("Manager received MQTT connect event.");
      this.isMqttConnected = true;
    });
    this.mqttClient.on("close", () => {
      logging.warn("Manager received MQTT close event.");
      this.isMqttConnected = false;
    });
    this.mqttClient.on("error", (err) => {
      logging.error("Manager received MQTT error event:", err.message);
      this.isMqttConnected = false;
    });
    this.mqttClient.on("offline", () => {
      logging.warn("Manager received MQTT offline event.");
    });
  }

  /** Attempts to connect the MQTT client using its async connect method. */
  async connectMqtt() {
    if (!this.mqttClient) {
      logging.error("Cannot connect MQTT: Client not initialized.");
      // Maybe try initializing it now? Depends on desired logic.
      // this.initializeMqttClient(); if (!this.mqttClient) return;
      return;
    }
    // Prevent concurrent connection attempts handled within Mqtt.connect() now

    try {
      logging.log("Manager requesting MQTT connection...");
      // Calls the refined async connect method in Mqtt class
      await this.mqttClient.connect();
      // Success is handled by the 'connect' event listener setting isMqttConnected = true
      logging.log("Manager: MQTT connect() request finished (event listener confirms state).");
    } catch (error) {
      logging.error(`Manager: MQTT connection attempt failed: ${error.message}`);
      // Failure is handled by 'error' or 'close' event listeners setting isMqttConnected = false
      // Health check loop will retry if appropriate.
    }
  }

  /** Disconnects the MQTT client using its async disconnect method. */
  async disconnectMqtt() {
    if (this.mqttClient) {
      logging.log("Manager requesting MQTT disconnection...");
      try {
        // Calls the refined async disconnect method in Mqtt class
        await this.mqttClient.disconnect();
        // Success is handled by the 'close' event listener setting isMqttConnected = false
        logging.log("Manager: MQTT disconnect() request finished (event listener confirms state).");
      } catch (error) {
        // Should not happen if Mqtt.disconnect handles its errors, but log just in case.
        logging.error(`Manager: MQTT disconnection attempt threw an unexpected error: ${error}`);
      }
      // Explicitly set state here too, though 'close' event should also fire
      this.isMqttConnected = false;
      // Optionally nullify the client after ensuring disconnect?
      // this.mqttClient = null; // Or do this in initializeMqttClient when creating new
    } else {
      logging.debug("Manager: MQTT disconnect requested but no client instance exists.");
      this.isMqttConnected = false; // Ensure state is consistent
    }
  }

  /** Health check loop using setTimeout */
  startHealthCheckLoop() {
    logging.log("Starting health check loop.");
    const loop = async () => {
      if (!this.isInitialized && !this.isInitializing) {
        logging.warn("Manager not ready, skipping health check iteration.");
        this.healthCheckTimeoutId = setTimeout(loop, this.healthCheckIntervalMs);
        return;
      }

      logging.debug("Running health check iteration...");
      try {
        // 1. Always check API status to detect recovery from offline state
        const grillIsOnlineNow = await this.checkAndUpdateGrillStatus(this.api.grills[0].identifier);

        // 2. If API thinks grill is ONLINE, ensure MQTT is connected
        if (grillIsOnlineNow && !this.isInSleepMode) {
          if (!this.mqttClient) {
            // This case should ideally not happen if exit from sleep mode worked, but handle defensively
            logging.warn("Health Check: Grill online (API), but MQTT client not initialized! Initializing...");
            this.initializeMqttClient(); // Setup client and listeners
            if (this.mqttClient) {
              // Check if init succeeded
              await this.connectMqtt(); // Attempt connection
            }
          } else if (!this.isMqttConnected) {
            // API says online, but our MQTT state is disconnected. Try connecting.
            logging.warn("Health Check: Grill online (API), but MQTT disconnected. Requesting connection...");
            await this.connectMqtt();
          } else {
            // API online, MQTT connected - all good.
            logging.debug("Health Check: Grill online (API) and MQTT connected.");
          }
        }
        // 3. Handle sleep mode status reporting
        else if (this.isInSleepMode) {
          logging.debug("Health Check: Manager is in sleep mode (grill offline via API).");
          // Ensure MQTT is disconnected if we are in sleep mode? (Optional)
          // if (this.isMqttConnected) {
          //    logging.warn("Health Check: In sleep mode but MQTT is connected. Disconnecting.");
          //    await this.disconnectMqtt();
          // }
        }
        // Note: The case where API says offline but not yet in sleep mode is handled within checkAndUpdateGrillStatus
      } catch (error) {
        // Catch errors from checkAndUpdateGrillStatus or connectMqtt within the loop
        logging.error("Error during health check loop iteration:", error.message);
      } finally {
        // Schedule the next run only if manager hasn't been shut down
        // Check timeoutId itself - it's cleared in shutdown()
        if (this.healthCheckTimeoutId !== null) {
          this.healthCheckTimeoutId = setTimeout(loop, this.healthCheckIntervalMs);
        } else {
          logging.log("Health check loop stopping due to manager shutdown.");
        }
      }
    };

    // Clear previous timeout if any and start the loop
    if (this.healthCheckTimeoutId) clearTimeout(this.healthCheckTimeoutId);
    // Start first check immediately or after a delay? Let's delay initially.
    this.healthCheckTimeoutId = setTimeout(loop, this.healthCheckIntervalMs);
  }

  /** Starts the background API polling loops */
  startApiPollingLoops() {
    logging.log("Starting API polling loops...");
    this.apiPollingLoops = this.api.grills.map((grill) => {
      // Run pollUpdates, but don't await it here as it's an infinite loop
      this.pollUpdates(grill.identifier, this.api);
      // Return value isn't used currently for control, see shutdown comment
      return { identifier: grill.identifier /*, stop: () => {} */ };
    });
  }

  /** Distributes incoming MQTT data to the correct Grill object */
  // Updated signature to accept grillId passed from Mqtt class
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
    const grill = this.api.getGrillById(grillId); // Use the ID directly

    if (grill) {
      try {
        grill.pushData(data); // Push data to the Grill object
        logging.debug(`Dispatched MQTT data to grill ${grill.identifier}. Current grill.isOn state: ${grill.isOn}`);

        // Optional Consistency Check: Does MQTT data conflict with API view?
        if (this.isGrillConsideredOnline === false && grill.isOn === true) {
          logging.warn(`MQTT data for ${grillId} indicates ONLINE, but API check last reported OFFLINE. State may be changing.`);
          // Could trigger an immediate health check iteration if needed:
          // if (this.healthCheckTimeoutId) { /* logic to run health check now */ }
        } else if (this.isGrillConsideredOnline === true && grill.isOn === false && data.status?.connected === false) {
          logging.warn(`MQTT data for ${grillId} indicates OFFLINE, but API check last reported ONLINE. State may be changing.`);
        }
      } catch (e) {
        logging.error(`Error pushing MQTT data to grill ${grillId}:`, e);
      }
    } else {
      // This might happen if grills are removed from account but MQTT connection persists briefly
      logging.warn(`Manager received MQTT data for unknown/stale grill ID: ${grillId}`);
    }
  }

  /** Polling loop for a single grill using the API */
  async pollUpdates(grillIdentifier, parentApi) {
    logging.log(`Starting API polling loop for grill ${grillIdentifier}`);
    // Basic flag for stopping; needs improvement for robust shutdown in shutdown()
    let shouldContinue = true;
    // TODO: Integrate with shutdown signal more formally

    while (shouldContinue && this.isInitialized) {
      // Also check if manager is still initialized
      let intervalSeconds = parentApi.intervalIdle; // Default to idle
      try {
        const grillObject = parentApi.getGrillById(grillIdentifier);

        if (grillObject) {
          // Determine interval based on grill's *current known* state from Grill object
          intervalSeconds = grillObject.isOn ? parentApi.intervalBusy : parentApi.intervalIdle;

          logging.debug(`Polling API for ${grillIdentifier}. Interval: ${intervalSeconds}s (Grill isOn: ${grillObject.isOn})`);

          // Authentication refresh is handled within api.updateGrill now if needed
          // await parentApi.doCognito(); // No longer needed here

          // Fetch the latest data via API - updateGrill handles retries & pushes data
          await parentApi.updateGrill(grillIdentifier);
          logging.debug(`API poll completed for ${grillIdentifier}. Grill object state - isOn: ${grillObject.isOn}`);
        } else {
          logging.warn(`Could not find grill object for ${grillIdentifier} during polling. Using idle interval.`);
          intervalSeconds = parentApi.intervalIdle;
        }
      } catch (exception) {
        logging.error(`Error during API polling loop for ${grillIdentifier}:`, exception.message);
        // Don't stop the loop on error, just use idle interval before retrying
        intervalSeconds = parentApi.intervalIdle;
      }

      // Wait for the determined interval
      try {
        await new Promise((resolve) => setTimeout(resolve, intervalSeconds * 1000));
      } catch (e) {
        /* Catch potential errors if timeout mechanism changes */
      }

      // Check flag again before next iteration (primitive stop mechanism)
      // shouldContinue = /* check some global shutdown flag */ ;
      if (!this.isInitialized) {
        // Stop if manager shut down
        shouldContinue = false;
      }
    }
    logging.log(`Stopped API polling loop for grill ${grillIdentifier}`);
  }
}

export default Manager;
