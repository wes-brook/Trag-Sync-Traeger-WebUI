// Use a structured logger
const logging = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: process.env.NODE_ENV !== 'production' ? console.debug : () => {},
};

class Grill {
constructor(identifier) {
  if (!identifier) {
      throw new Error("Grill identifier cannot be empty.");
  }
  this.identifier = identifier;
  this.data = {}; // Stores the latest state received (from MQTT or API)
  this.lastUpdate = null; // Timestamp of the last successful data push
  this.isOn = false; // Start assuming 'off' until data confirms otherwise. Safer default.
  this.listeners = []; // For observer pattern (currently unused by Manager)

  logging.debug(`Grill object created for identifier: ${identifier}`);
}

/**
 * Updates the grill's state with new data and notifies listeners.
 * Called by Api.updateGrill response and Manager's MQTT dispatcher.
 * @param {object} newData - The new state data object.
 */
pushData(newData) {
  if (!newData || typeof newData !== 'object') {
      logging.warn(`[${this.identifier}] Received invalid data in pushData:`, newData);
      return;
  }

  logging.debug(`[${this.identifier}] Pushing new data. Current isOn: ${this.isOn}`);
  // Log the full structure if debugging deep issues:
  // logging.debug(`[${this.identifier}] Raw data received:`, JSON.stringify(newData, null, 2));

  this.data = newData; // Overwrite with the latest data
  this.lastUpdate = Date.now(); // Update timestamp

  // Determine 'isOn' based on the 'connected' field in the 'status' object
  // Default to current state if 'status' or 'connected' is missing in newData
  const previousIsOn = this.isOn;
  if (newData.status && typeof newData.status.connected === 'boolean') {
      this.isOn = newData.status.connected;
  } else {
      // If new data lacks status/connected, maintain previous state? Or assume off?
      // Let's maintain previous state for now, could be a partial update.
      logging.debug(`[${this.identifier}] New data missing status.connected, maintaining previous isOn state: ${this.isOn}`);
  }

  if (previousIsOn !== this.isOn) {
       logging.log(`[${this.identifier}] Grill 'isOn' status changed: ${this.isOn}`);
  }

  // --- Example: Extract specific fields for logging ---
  // const friendlyName = this.data.details?.friendlyName ?? "Unknown";
  // const currentTemp = this.data.status?.grill ?? "N/A";
  // const probeTemp = this.data.status?.probe ?? "N/A";
  // const setTemp = this.data.status?.set ?? "N/A";
  // logging.debug(`[${this.identifier}] State: Name=${friendlyName}, Temp=${currentTemp}, Probe=${probeTemp}, Set=${setTemp}, Connected=${this.isOn}`);
  // --- End Example ---

  // Notify listeners (if any)
  if (this.listeners.length > 0) {
      logging.debug(`[${this.identifier}] Notifying ${this.listeners.length} listeners.`);
      for (const listener of this.listeners) {
        try {
          listener(this); // Pass the updated Grill instance
        } catch (error) {
          // Prevent a faulty listener from crashing the application
          logging.error(`[${this.identifier}] Listener execution failed:`, error);
        }
      }
  }
}

/** Registers a listener function to be called when data is pushed. */
registerListener(listener) {
  if (typeof listener === 'function') {
      this.listeners.push(listener);
      logging.debug(`[${this.identifier}] Listener registered.`);
  } else {
      logging.warn(`[${this.identifier}] Attempted to register invalid listener.`);
  }
}

 /** Removes a specific listener function. */
unregisterListener(listener) {
   this.listeners = this.listeners.filter(l => l !== listener);
   logging.debug(`[${this.identifier}] Listener unregistered.`);
}

/** Returns the grill's identifier */
toString() {
  return this.identifier;
}
}

export default Grill;