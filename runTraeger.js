import dotenv from "dotenv";
dotenv.config();

import TraegerManager from "./manager.js";
import { createLogger, format, transports } from "winston";

// Constants
const _username = process.env.USERNAME_;
const _password = process.env.PASSWORD_;

// Logger Setup
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "hh:mm:ss A" }),
    format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} - ${level.toUpperCase()} - ${message}`
    )
  ),
  transports: [
    new transports.Console({
      level: "info",
    }),
  ],
});

// Function to handle grill events
function callMe(eventGrill) {
  logger.info(`Listener triggered for grill: ${eventGrill.identifier}`); // Debug log
  const { data } = eventGrill;

  // Extract the required fields
  const friendlyName = data.details?.friendlyName || "Unknown";
  const grillTemp = data.status?.grill || "N/A";
  const grillProbeTemp = data.status?.probe || "N/A";
  const grillSetTemp = data.status?.set || "N/A";

  // Skip logging if all temperatures are "N/A"
  if (
    grillTemp === "N/A" &&
    grillProbeTemp === "N/A" &&
    grillSetTemp === "N/A"
  ) {
    return;
  }

  // Log the extracted data
  logger.info(`Grill: ${friendlyName}`);
  if (grillTemp !== "N/A") logger.info(`Grill Temp: ${grillTemp}°F`);
  if (grillProbeTemp !== "N/A")
    logger.info(`Grill Probe Temp: ${grillProbeTemp}°F`);
  if (grillSetTemp !== "N/A") logger.info(`Grill Set Temp: ${grillSetTemp}°F`);
  logger.info("-----------------------------"); // Separator for readability
}

// Initialize the Traeger Manager
const manager = new TraegerManager(_username, _password, 10, 5);

// Register the event listener for each grill :: 10 second timeout to wait for manager to fetch grills
setTimeout(() => {
  manager.api.grills.forEach((grill) => {
    grill.registerListener(callMe);
  });
}, 10000); // NOTE: Wes this could become a bottleneck for end users if the AWS server doesn't initialize our grills in time (10s timeout)

// Keep the script running
setInterval(() => {
  // Keeps the process alive
}, 60000);
