import mqtt from "mqtt";
import url from "url";

const _LOGGER = console;

class Mqtt {
  constructor(connectString, grills, immediateInit = true) {
    this.connectString = connectString; // Ensure this is a string or a resolved Promise
    this.grills = grills;
    this.client = null;
    this.dataHook = null;
    this.reconnectAttempts = 0; // Track reconnect attempts
    this.maxReconnectAttempts = 5; // Maximum number of reconnect attempts

    if (immediateInit) {
      this.init();
      this.start();
    }
  }

  start() {
    if (this.client) {
      this.client.connect();
    }
  }

  setDataHook(hook) {
    this.dataHook = hook;
  }

  mqttOnConnect() {
    _LOGGER.debug("Client Connected");
    this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection

    // Re-subscribe to topics
    for (const grill of this.grills) {
      this.client.subscribe(`prod/thing/update/${grill}`, { qos: 1 }, (err) => {
        if (!err) {
          _LOGGER.debug(`Subscribed to updates for grill: ${grill}`);
        } else {
          _LOGGER.warn(`Failed to subscribe to grill: ${grill}`, err);
        }
      });
    }
  }

  mqttOnConnectFail(err) {
    _LOGGER.debug("Connect Fail Callback. Grill Connect Failed!", err);
    this.handleReconnect();
  }

  mqttOnLog(level, buf) {
    _LOGGER.debug(`OnLog: Level: ${level}, Buf: ${buf}`);
  }

  mqttOnSubscribe(err, granted) {
    if (err) {
      _LOGGER.warn("Subscription error:", err);
    } else {
      _LOGGER.debug("Subscription granted:", granted);
    }
  }

  mqttOnMessage(topic, payload) {
    _LOGGER.debug(`Message for Grill: ${topic}`);

    try {
      const data = JSON.parse(payload.toString());
      if (this.dataHook) {
        this.dataHook(topic, data);
      }
    } catch (err) {
      _LOGGER.warn("Error processing message:", err);
    }
  }

  async init() {
    try {
      // Ensure connectString is resolved if it's a Promise
      const connectString = await Promise.resolve(this.connectString);

      const mqttParts = url.parse(connectString);

      const options = {
        port: 443,
        host: mqttParts.hostname,
        path: mqttParts.path,
        rejectUnauthorized: false, // Equivalent to verify_mode=ssl.CERT_NONE
        reconnectPeriod: 3000, // Reconnect every 3 seconds
        connectTimeout: 30 * 1000, // 30 seconds
        wsOptions: {
          headers: {
            Host: mqttParts.host,
          },
        },
      };

      this.client = mqtt.connect(connectString, options);

      this.client.on("connect", () => this.mqttOnConnect());
      this.client.on("error", (err) => this.mqttOnConnectFail(err));
      this.client.on("close", () => this.handleReconnect()); // Handle connection close
      this.client.on("log", (level, buf) => this.mqttOnLog(level, buf));
      this.client.on("subscribe", (err, granted) =>
        this.mqttOnSubscribe(err, granted)
      );
      this.client.on("message", (topic, payload) =>
        this.mqttOnMessage(topic, payload)
      );

      _LOGGER.debug(`Connecting to ${mqttParts.host}`);
    } catch (error) {
      _LOGGER.error("Error initializing MQTT:", error);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      _LOGGER.debug(`Attempting to reconnect (Attempt ${this.reconnectAttempts})...`);
      this.init(); // Reinitialize the MQTT client
    } else {
      _LOGGER.error("Max reconnect attempts reached. Giving up.");
    }
  }
}

export default Mqtt;