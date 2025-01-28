import axios from "axios";
import Grill from "./grill.js";

const AMAZON_COGNITO_GATEWAY = "https://cognito-idp.us-west-2.amazonaws.com/";
const AMAZON_API_ENDPOINT = "https://1ywgyc65d1.execute-api.us-west-2.amazonaws.com/prod/";
const TRAEGER_CLIENT_ID = "2fuohjtqv1e63dckp5v84rau0j"; // Traeger-ID

const AMAZON_COMMAND_CODES = {
  refresh: 90,
};
const HTTP_TIMEOUT = 30000; // Increased to 30s from 20s

class Api {
  constructor(
    username = "",
    password = "",
    intervalIdle = 60 * 5,
    intervalBusy = 10,
    immediateInit = true
  ) {
    // Ensure username and password are strings
    this.username = typeof username === "string" ? username : "";
    this.password = typeof password === "string" ? password : "";

    this.intervalIdle = intervalIdle;
    this.intervalBusy = intervalBusy;
    this.grills = []; // Will store grill instances

    this.cognitoDetails = null;
    this.cognitoRefreshToken = null;

    this.mqttEndpoint = null;

    if (immediateInit) {
      this.init();
    }
  }

  async init() {
    console.debug("Initialization of API");
    await this.doCognito();
    await this.getGrills();

    for (const grill of this.grills) {
      await this.updateGrill(grill.identifier);
    }
  }

  getAmzDate() {
    return new Date().toISOString().replace(/[:-]|\.\d{3}/g, ""); // Format to 'YYYYMMDDTHHMMSSZ'
  }

  async doCognito() {
    console.debug("Cognito Initiation");
    const now = new Date();

    if (
      this.cognitoDetails &&
      new Date(this.cognitoDetails.Date).getTime() +
        this.cognitoDetails.ExpiresIn * 0.8 * 1000 >=
        now.getTime()
    ) {
      console.debug("Still Logged-In. No Cognito Refresh Triggered");
      return;
    }

    console.debug("Cognito Refresh Triggered"); 
    let data;

    if (this.cognitoRefreshToken) {
      console.debug("Cognito Refreshmethod: Refreshtoken");
      data = {
        ClientMetadata: {},
        AuthParameters: {
          REFRESH_TOKEN: this.cognitoRefreshToken,
          USERNAME: this.username, // Ensure this is a string
        },
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: TRAEGER_CLIENT_ID,
      };
    } else {
      console.debug("Cognito Refreshmethod: Password Auth");
      data = {
        ClientMetadata: {},
        AuthParameters: {
          USERNAME: this.username, // Ensure this is a string
          PASSWORD: this.password, // Ensure this is a string
        },
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: TRAEGER_CLIENT_ID,
      };
    }

    // console.debug("Cognito Payload:", JSON.stringify(data, null, 2));
    // console.debug("Cognito Headers:", {
    //   "Content-Type": "application/x-amz-json-1.1",
    //   "X-Amz-Date": this.getAmzDate(),
    //   "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
    // });

    try {
      const response = await axios.post(AMAZON_COGNITO_GATEWAY, data, {
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Date": this.getAmzDate(),
          "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
        },
        timeout: HTTP_TIMEOUT,
      });

      // console.debug("Cognito Response:", response.data);

      if (response.status === 200) {
        this.cognitoDetails = response.data.AuthenticationResult;
        if (response.data.AuthenticationResult.RefreshToken) {
          this.cognitoRefreshToken =
            response.data.AuthenticationResult.RefreshToken;
        }
        this.cognitoDetails.Date = now.toISOString();
        console.debug("Login successful, cognitoDetails:", this.cognitoDetails);
      } else {
        throw new Error("Failed to authenticate with Cognito");
      }
    } catch (error) {
      console.error(
        "Cognito Error:",
        error.response ? error.response.data : error.message
      );
      throw new Error("Failed to authenticate with Cognito");
    }
  }

  async getGrills() {
    console.debug("Inventory-Update");
    const response = await axios.get(`${AMAZON_API_ENDPOINT}/users/self`, {
      headers: {
        Authorization: this.cognitoDetails.AccessToken,
      },
      timeout: HTTP_TIMEOUT,
    });

    if (response.status === 200) {
      const grills = response.data.things;
      this.grills = grills.map((grill) => new Grill(grill.thingName)); // Create Grill instances
      for (const grill of grills) {
        console.debug("Added ID:", grill.thingName);
      }
    } else {
      throw new Error("Failed to fetch grills");
    }
  }

  async updateGrill(grillIdentifier, retries = 3, delay = 5000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(
          `${AMAZON_API_ENDPOINT}/things/${grillIdentifier}/commands`,
          {
            command: AMAZON_COMMAND_CODES.refresh,
          },
          {
            headers: {
              Authorization: this.cognitoDetails.AccessToken,
              "Content-Type": "application/json",
              "Accept-Language": "en-us",
              "X-Amz-Date": this.getAmzDate(),
              "User-Agent": "Traeger/11 CFNetwork/1209 Darwin/20.2.0",
            },
            timeout: HTTP_TIMEOUT,
          }
        );
  
        if (response.status === 200) {
          const grill = this.grills.find((g) => g.identifier === grillIdentifier);
          if (grill) {
            grill.pushData(response.data); // Update the grill data
          }
          return; // Exit the function on success
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed for grill ${grillIdentifier}:`, error.message);
        if (attempt === retries) {
          throw new Error(`Failed to update grill: ${grillIdentifier} after ${retries} attempts`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1))); // Exponential backoff
      }
    }
  }

  async getMqttEndpoint() {
    if (!this.cognitoDetails) {
      throw new Error("Cognito details not initialized");
    }

    const response = await axios.post(
      `${AMAZON_API_ENDPOINT}/mqtt-connections`,
      {},
      {
        headers: {
          Authorization: this.cognitoDetails.AccessToken,
          "X-Amz-Date": this.getAmzDate(),
          "Content-Type": "application/json",
          "Accept-Language": "en-us",
          "User-Agent": "Traeger/11 CFNetwork/1209 Darwin/20.2.0",
        },
        timeout: HTTP_TIMEOUT,
      }
    );

    if (response.status === 200) {
      this.mqttEndpoint = response.data.signedUrl;
      return this.mqttEndpoint;
    } else {
      throw new Error("Failed to fetch MQTT endpoint");
    }
  }
}

export default Api;
