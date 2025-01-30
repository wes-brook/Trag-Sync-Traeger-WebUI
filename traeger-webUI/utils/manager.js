import Mqtt from "./mqtt.js";
import Api from "./api.js";

const logging = console; // Replace with a logging library if needed

class Manager {
  constructor(
    username = "",
    password = "",
    intervalIdle = 60 * 5,
    intervalBusy = 10
  ) {
    this.api = new Api(username, password, intervalIdle, intervalBusy);

    // Wait for the API to initialize before proceeding
    this.waitForApiInitialization()
      .then(() => {
        this.mqttClient = new Mqtt(
          this.api.getMqttEndpoint(),
          this.api.grills.map((grill) => grill.identifier)
        );
        this.mqttClient.setDataHook(this.mqttEventDispatcher.bind(this));
        this.startApiPollingThreads();
      })
      .catch((error) => {
        logging.error("Failed to initialize API:", error);
      });
  }

  async waitForApiInitialization() {
    // Wait until the API has fetched grills and is ready
    while (!this.api.grills || this.api.grills.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      logging.debug("Waiting for API to initialize...");
    }
    logging.debug("API initialization complete.");
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
