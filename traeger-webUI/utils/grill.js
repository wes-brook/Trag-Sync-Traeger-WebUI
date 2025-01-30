class Grill {
  constructor(identifier) {
    this.identifier = identifier;
    this.data = {};
    this.lastUpdate = null;
    this.isOn = true; // Default value of "ON" might speed up the initialization phase as it is primarily used for poll scheduling
    this.listeners = [];
  }

  pushData(data) {
    this.data = data;

    // Log the data object to understand its structure
    console.debug("Received data:", data); // UNCOMMENT ME TO SEE ALL THE RESPONSE DATA WE GET FROM AWS

    // Check if data.status exists before accessing data.status.connected
    if (data && data.status) {
      this.isOn = data.status.connected;

      // // Extract and print the required fields
      // const friendlyName = data.details?.friendlyName || "Unknown";
      // const grillTemp = data.status?.grill || "N/A";
      // const grillProbeTemp = data.status?.probe || "N/A";
      // const grillSetTemp = data.status?.set || "N/A";
      //
      // console.log(`Grill: ${friendlyName}`);
      // console.log(`Grill Temp: ${grillTemp}°F`);
      // console.log(`Grill Probe Temp: ${grillProbeTemp}°F`);
      // console.log(`Grill Set Temp: ${grillSetTemp}°F`);
    } else {
      // console.warn("Data or data.status is undefined. Setting isOn to false.");
      this.isOn = false; // or handle it in a way that makes sense for your application
    }

    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (error) {
        // Suppress errors from listeners
        console.error("Listener execution failed:", error);
      }
    }
  }

  registerListener(listener) {
    this.listeners.push(listener);
  }

  toString() {
    return this.identifier;
  }
}

export default Grill;
