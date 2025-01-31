import Mqtt from "./mqtt.js";
import Api from "./api.js";

const logging = console;

class Manager {
  constructor(
    username = "",
    password = "",
    intervalIdle = 60 * 5,
    intervalBusy = 10
  ) {
    this.api = new Api(username, password, intervalIdle, intervalBusy);
    this.mqttClient = null;
    this.healthCheckInterval = 20 * 1000; // Check MQTT connection every 20 seconds
    this.isGrillOnline = false; // Track grill status
    this.sleepMode = false; // Track sleep mode

    // Wait for the API to initialize before proceeding
    this.waitForApiInitialization()
      .then(() => {
        this.initializeMqttClient();
        this.startApiPollingThreads();
        this.startHealthCheck(); // Start the health check
      })
      .catch((error) => {
        logging.error("Failed to initialize API:", error);
      });
  }

  async checkGrillStatus() {
    try {
      await this.api.init(); // Ensure the API is initialized
      await this.api.getGrills(); // Fetch grills

      if (this.api.grills.length > 0) {
        const grillIdentifier = this.api.grills[0].identifier;
        await this.api.updateGrill(grillIdentifier); // Update grill data
        const grill = this.api.grills.find((g) => g.identifier === grillIdentifier);

        // Check if the grill is online
        const isGrillOnline = grill?.data?.status?.connected || false;
        logging.debug(`Grill is ${isGrillOnline ? "online" : "offline"}`);

        // Update the grill status
        if (this.isGrillOnline !== isGrillOnline) {
          this.isGrillOnline = isGrillOnline;
          logging.debug(`Grill status changed to ${isGrillOnline ? "online" : "offline"}`);
        }

        // Exit sleep mode if the grill comes back online
        if (this.sleepMode && this.isGrillOnline) {
          logging.debug("Grill is back online. Exiting sleep mode.");
          this.sleepMode = false;
          this.initializeMqttClient(); // Reinitialize the MQTT client
        }

        // Enter sleep mode if the grill goes offline
        if (!this.sleepMode && !this.isGrillOnline) {
          logging.debug("Grill is offline. Entering sleep mode.");
          this.sleepMode = true;
        }
      }
    } catch (error) {
      logging.error("Error checking grill status:", error);
      this.isGrillOnline = false; // Assume grill is offline if there's an error
    }
  }

  async waitForApiInitialization() {
    // Wait until the API has fetched grills and is ready
    while (!this.api.grills || this.api.grills.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      logging.debug("Waiting for API to initialize...");
    }
    logging.debug("API initialization complete.");
  }

  initializeMqttClient() {
    this.mqttClient = new Mqtt(
      this.api.getMqttEndpoint(),
      this.api.grills.map((grill) => grill.identifier)
    );
    this.mqttClient.setDataHook(this.mqttEventDispatcher.bind(this));
  }

  startHealthCheck() {
    setInterval(async () => {
      if (this.sleepMode) {
        logging.debug("Backend is in sleep mode. Skipping health check.");
        return;
      }

      await this.checkGrillStatus(); // Check if the grill is online

      if (this.isGrillOnline) {
        if (!this.mqttClient?.client?.connected) {
          logging.warn("MQTT client is disconnected. Reinitializing...");
          this.initializeMqttClient(); // Reinitialize the MQTT client
        }
      } else {
        logging.debug("Grill is offline. Entering sleep mode.");
        this.sleepMode = true;
      }
    }, this.healthCheckInterval); // Run every 20 seconds
  }

  startApiPollingThreads() {
    for (const grill of this.api.grills) {
      this.pollUpdates(grill.identifier, this.api);
    }
  }

  mqttEventDispatcher(topic, data) {
    for (const grill of this.api.grills) {
      if (topic.endsWith(grill.identifier)) {
        grill.pushData(data);
        logging.debug(
          `Message Received from Grill(${topic}): Online: ${data.status.connected}`
        );
        break;
      }
    }
  }

  async pollUpdates(grillIdentifier, parentApi) {
    while (true) {
      try {
        let grillObject = null;

        for (const grill of parentApi.grills) {
          if (grill.identifier === grillIdentifier) {
            grillObject = grill;
            break;
          }
        }

        const interval = grillObject?.isOn
          ? parentApi.intervalBusy
          : parentApi.intervalIdle;
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));

        logging.debug(`Polling Update for ${grillIdentifier}`);
        parentApi.doCognito();
        parentApi.updateGrill(grillIdentifier);
      } catch (exception) {
        logging.error(exception);
      }
    }
  }
}

export default Manager;