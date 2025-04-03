import axios from 'axios';
import Grill from './grill.js'; // Ensure path is correct

// Use a structured logger (same pattern as manager/server)
const logging = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: process.env.NODE_ENV !== 'production' ? console.debug : () => {},
};

const AMAZON_COGNITO_GATEWAY = 'https://cognito-idp.us-west-2.amazonaws.com/';
const AMAZON_API_ENDPOINT = 'https://1ywgyc65d1.execute-api.us-west-2.amazonaws.com/prod/';
const TRAEGER_CLIENT_ID = '2fuohjtqv1e63dckp5v84rau0j'; // Traeger-ID

const AMAZON_COMMAND_CODES = {
  refresh: 90,
};
const HTTP_TIMEOUT = 30 * 1000; // 30 seconds

class Api {
  constructor(
    username = '',
    password = '',
    intervalIdle = 60 * 5,
    intervalBusy = 10
  ) {
    if (!username || !password) {
        throw new Error('API requires username and password.');
    }
    this.username = username;
    this.password = password;

    this.intervalIdle = intervalIdle;
    this.intervalBusy = intervalBusy;
    this.grills = []; // Stores Grill instances

    this.cognitoDetails = null; // Stores { AccessToken, RefreshToken, IdToken, ExpiresIn, TokenType }
    this.cognitoExpiresAt = null; // Stores expiry timestamp (Date.now() + ExpiresIn * 1000)
    this.cognitoRefreshToken = null;

    this.mqttEndpoint = null;
  }

  /**
   * Initializes API by authenticating and fetching initial grill data.
   * Should be called by Manager.
   */
  async init() {
    logging.debug('API Initialization started...');
    await this.doCognito(); // Authenticate first
    await this.getGrills(); // Then get list of grills

    // Fetch initial state for each grill
    // Use Promise.all for concurrent updates
    await Promise.all(
        this.grills.map(grill => this.updateGrill(grill.identifier))
    );
    logging.debug('API Initialization complete.');
  }

  /** Helper to get AMZ date format */
  getAmzDate() {
    return new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  }

  /** Handles Cognito authentication and token refresh */
  async doCognito() {
    const now = Date.now();

    // Check if current token is still valid (within 80% of its lifetime)
    if (this.cognitoDetails && this.cognitoExpiresAt && this.cognitoExpiresAt > now) {
      logging.debug('Cognito token still valid. Skipping refresh.');
      return;
    }

    logging.debug('Cognito token expired or missing. Attempting refresh/auth...');
    let authFlow;
    let authParameters;

    if (this.cognitoRefreshToken) {
      logging.debug('Using REFRESH_TOKEN_AUTH flow.');
      authFlow = 'REFRESH_TOKEN_AUTH';
      authParameters = {
        REFRESH_TOKEN: this.cognitoRefreshToken,
        // USERNAME: this.username, // Not typically needed for refresh flow, but Traeger might require it
      };
    } else {
      logging.debug('Using USER_PASSWORD_AUTH flow.');
      authFlow = 'USER_PASSWORD_AUTH';
      authParameters = {
        USERNAME: this.username,
        PASSWORD: this.password,
      };
    }

    const payload = {
      ClientId: TRAEGER_CLIENT_ID,
      AuthFlow: authFlow,
      AuthParameters: authParameters,
      ClientMetadata: {}, // Can be empty
    };

    try {
      const response = await axios.post(AMAZON_COGNITO_GATEWAY, payload, {
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
          'X-Amz-Date': this.getAmzDate(), // Generate fresh date for each request
          // No Authorization header needed for InitiateAuth
        },
        timeout: HTTP_TIMEOUT,
      });

      if (response.status === 200 && response.data.AuthenticationResult) {
        this.cognitoDetails = response.data.AuthenticationResult;
        // Store expiry time stamp for easier checking
        this.cognitoExpiresAt = Date.now() + (this.cognitoDetails.ExpiresIn * 1000 * 0.8); // Use 80% buffer

        // Update refresh token if provided (usually only with password auth)
        if (this.cognitoDetails.RefreshToken) {
          this.cognitoRefreshToken = this.cognitoDetails.RefreshToken;
        }
        logging.debug('Cognito authentication/refresh successful.');
      } else {
        // Throw specific error based on response if possible
         throw new Error(`Cognito authentication failed: Status ${response.status} - ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      const errorMsg = error.response
        ? `Status ${error.response.status} - ${JSON.stringify(error.response.data)}`
        : error.message;
      logging.error(`Cognito Error: ${errorMsg}`);
      // Reset auth details on failure? Maybe not on refresh failure.
      // this.cognitoDetails = null;
      // this.cognitoRefreshToken = null;
      // this.cognitoExpiresAt = null;
      throw new Error(`Cognito authentication failed: ${errorMsg}`); // Re-throw for Manager to handle
    }
  }

  /** Fetches list of grills associated with the account */
  async getGrills() {
    if (!this.cognitoDetails?.AccessToken) {
        throw new Error("Cannot get grills: Not authenticated (missing AccessToken).");
    }
    logging.debug('Fetching grill inventory...');
    try {
      const response = await axios.get(`${AMAZON_API_ENDPOINT}users/self`, {
        headers: {
          Authorization: this.cognitoDetails.AccessToken,
          'X-Amz-Date': this.getAmzDate(),
        },
        timeout: HTTP_TIMEOUT,
      });

      if (response.status === 200 && response.data.things) {
        logging.debug(`Found ${response.data.things.length} grills.`);
        // Create Grill instances, replacing existing array
        this.grills = response.data.things.map(grill => new Grill(grill.thingName));
      } else {
         throw new Error(`Failed to fetch grills: Status ${response.status} - ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
       const errorMsg = error.response
         ? `Status ${error.response.status} - ${JSON.stringify(error.response.data)}`
         : error.message;
       logging.error(`Get Grills Error: ${errorMsg}`);
       this.grills = []; // Clear grills on error
       throw new Error(`Failed to fetch grills: ${errorMsg}`);
    }
  }

  /** Helper method to find a grill instance by its identifier */
  getGrillById(identifier) {
      return this.grills.find(g => g.identifier === identifier);
  }

  /** Sends a command to update/refresh a specific grill's state */
  async updateGrill(grillIdentifier, retries = 3, delayMs = 1000) {
    if (!this.cognitoDetails?.AccessToken) {
        throw new Error(`Cannot update grill ${grillIdentifier}: Not authenticated.`);
    }

    const grill = this.getGrillById(grillIdentifier);
    if (!grill) {
        logging.warn(`Attempted to update non-existent grill: ${grillIdentifier}`);
        return; // Or throw an error?
    }

    logging.debug(`Sending refresh command to grill: ${grillIdentifier}`);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Ensure token is fresh before making state-changing(?) call
        // await this.doCognito(); // Consider if needed before *every* update command

        const response = await axios.post(
          `${AMAZON_API_ENDPOINT}things/${grillIdentifier}/commands`,
          { command: AMAZON_COMMAND_CODES.refresh }, // Payload requires 'command'
          {
            headers: {
              Authorization: this.cognitoDetails.AccessToken,
              'Content-Type': 'application/json',
              'Accept-Language': 'en-us',
              'User-Agent': 'TragSync/1.0', // Use a custom user agent
               'X-Amz-Date': this.getAmzDate(),
            },
            timeout: HTTP_TIMEOUT,
          }
        );

        // Log the structure of response data if needed for debugging
        // logging.debug(`UpdateGrill response data for ${grillIdentifier}:`, response.data);

        if (response.status === 200) {
          // Even if status is 200, response.data might be empty or just confirmation.
          // The actual state update often comes via MQTT triggered by this command.
          // However, if response.data *does* contain state, push it.
          if (response.data && Object.keys(response.data).length > 0) {
             logging.debug(`Pushing updateGrill response data to ${grillIdentifier}`);
             grill.pushData(response.data); // Update local Grill instance
          } else {
             logging.debug(`Refresh command sent successfully to ${grillIdentifier}, no state data in response.`);
          }
          return; // Success, exit loop and function
        } else {
           // Handle non-200 status as error for retry
           throw new Error(`Non-200 status: ${response.status} - ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        const isAuthError = error.response?.status === 401 || error.response?.status === 403;
        const errorMsg = error.response
            ? `Status ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : error.message;
        logging.warn(`Update Grill Error (Attempt ${attempt}/${retries} for ${grillIdentifier}): ${errorMsg}`);

        // If it's an auth error on the first attempt, try refreshing Cognito once immediately
        if (isAuthError && attempt === 1) {
            logging.warn(`Authentication error detected on updateGrill for ${grillIdentifier}. Attempting immediate Cognito refresh.`);
            try {
                await this.doCognito();
                // Don't count this as a full retry attempt, just continue the loop for the *next* attempt
                continue;
            } catch (cognitoError) {
                 logging.error(`Immediate Cognito refresh failed during updateGrill retry: ${cognitoError.message}`);
                 // Fall through to normal retry logic / failure
            }
        }


        if (attempt === retries) {
          throw new Error(`Failed to update grill ${grillIdentifier} after ${retries} attempts: ${errorMsg}`);
        }
        // Exponential backoff, ensure delay is reasonable
        const waitTime = Math.min(delayMs * Math.pow(2, attempt - 1), 30000); // Cap wait time
        logging.debug(`Retrying updateGrill for ${grillIdentifier} in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /** Fetches the MQTT WebSocket endpoint URL */
  async getMqttEndpoint() {
    if (!this.cognitoDetails?.AccessToken) {
        throw new Error("Cannot get MQTT endpoint: Not authenticated.");
    }
    logging.debug('Fetching MQTT endpoint...');
    try {
       // Ensure token is fresh before getting potentially short-lived MQTT URL
       await this.doCognito();

      const response = await axios.post(
        `${AMAZON_API_ENDPOINT}mqtt-connections`,
        {}, // Empty payload
        {
          headers: {
            Authorization: this.cognitoDetails.AccessToken,
            'Content-Type': 'application/json',
            'Accept-Language': 'en-us',
            'User-Agent': 'TragSync/1.0',
            'X-Amz-Date': this.getAmzDate(),
          },
          timeout: HTTP_TIMEOUT,
        }
      );

      if (response.status === 200 && response.data.signedUrl) {
        this.mqttEndpoint = response.data.signedUrl;
        logging.debug('MQTT endpoint fetched successfully.');
        return this.mqttEndpoint;
      } else {
         throw new Error(`Failed to fetch MQTT endpoint: Status ${response.status} - ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
       const errorMsg = error.response
         ? `Status ${error.response.status} - ${JSON.stringify(error.response.data)}`
         : error.message;
       logging.error(`Get MQTT Endpoint Error: ${errorMsg}`);
       this.mqttEndpoint = null;
       throw new Error(`Failed to fetch MQTT endpoint: ${errorMsg}`);
    }
  }
}

export default Api;