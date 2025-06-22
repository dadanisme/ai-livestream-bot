import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Logger } from "./Logger";

export class OAuth2Auth {
  private oauth2Client: OAuth2Client;
  private logger: Logger;

  constructor(clientId: string, clientSecret: string, refreshToken: string, logger: Logger) {
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      "http://localhost:8080" // Use localhost redirect URI
    );
    
    // Set the refresh token
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    
    this.logger = logger;
  }

  async getAuthenticatedClient(): Promise<OAuth2Client> {
    try {
      // Refresh the access token if needed
      await this.oauth2Client.getAccessToken();
      this.logger.info("OAuth2 authentication successful");
      return this.oauth2Client;
    } catch (error) {
      this.logger.error("OAuth2 authentication failed:", error);
      throw new Error("Failed to authenticate with OAuth2");
    }
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      const auth = await this.getAuthenticatedClient();
      const youtube = google.youtube({ version: "v3", auth });
      
      // Test the credentials by making a simple API call
      await youtube.channels.list({
        part: ["snippet"],
        mine: true,
        maxResults: 1,
      });
      
      this.logger.info("OAuth2 credentials verified successfully");
      return true;
    } catch (error) {
      this.logger.error("OAuth2 credentials verification failed:", error);
      return false;
    }
  }
} 