import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import * as http from "http";
import * as url from "url";
import open from "open";

export class OAuth2Setup {
  private oauth2Client: OAuth2Client;
  private port: number = 8080;

  constructor(clientId: string, clientSecret: string) {
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `http://localhost:${this.port}`
    );
  }

  async getRefreshToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
          "https://www.googleapis.com/auth/youtube.readonly",
          "https://www.googleapis.com/auth/youtube.force-ssl",
        ],
        prompt: "consent", // Force consent to get refresh token
      });

      console.log("\n🔐 YouTube OAuth2 Setup");
      console.log("======================");
      console.log("1. Opening browser for authentication...");
      console.log("2. Sign in with your Google account");
      console.log("3. Grant the requested permissions");
      console.log("4. You'll be redirected back automatically");
      console.log("\nWaiting for authentication...");

      // Create a simple HTTP server to handle the OAuth2 callback
      const server = http.createServer(async (req, res) => {
        const queryObject = url.parse(req.url!, true).query;
        const code = queryObject.code as string;
        const error = queryObject.error as string;

        if (error) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body>
                <h1>❌ Authentication Failed</h1>
                <p>Error: ${error}</p>
                <p>Please try again.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error(`OAuth2 error: ${error}`));
          return;
        }

        if (!code) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body>
                <h1>❌ No Authorization Code</h1>
                <p>No authorization code received. Please try again.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error("No authorization code received"));
          return;
        }

        try {
          const { tokens } = await this.oauth2Client.getToken(code);

          if (!tokens.refresh_token) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(`
              <html>
                <body>
                  <h1>❌ No Refresh Token</h1>
                  <p>No refresh token received. Please try again.</p>
                </body>
              </html>
            `);
            server.close();
            reject(new Error("No refresh token received"));
            return;
          }

          // Success response
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body>
                <h1>✅ OAuth2 Setup Successful!</h1>
                <p>Your refresh token has been generated.</p>
                <p>You can close this window and return to the terminal.</p>
              </body>
            </html>
          `);

          console.log("\n✅ OAuth2 setup successful!");
          console.log("Your refresh token:", tokens.refresh_token);
          console.log("\nAdd this to your .env file:");
          console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);

          server.close();
          resolve(tokens.refresh_token);
        } catch (error) {
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body>
                <h1>❌ Token Exchange Failed</h1>
                <p>Error: ${error}</p>
                <p>Please try again.</p>
              </body>
            </html>
          `);
          server.close();
          reject(error);
        }
      });

      // Start the server
      server.listen(this.port, () => {
        console.log(`Server listening on http://localhost:${this.port}`);
        
        // Open the browser
        open(authUrl);
      });

      // Handle server errors
      server.on('error', (error) => {
        if ((error as any).code === 'EADDRINUSE') {
          console.error(`❌ Port ${this.port} is already in use. Please close any applications using this port and try again.`);
        } else {
          console.error('❌ Server error:', error);
        }
        reject(error);
      });
    });
  }

  static printSetupInstructions(): void {
    console.log("\n📋 YouTube OAuth2 Setup Instructions");
    console.log("===================================");
    console.log(
      "1. Go to Google Cloud Console: https://console.cloud.google.com/"
    );
    console.log("2. Create a new project or select existing one");
    console.log("3. Enable YouTube Data API v3");
    console.log(
      "4. Go to 'Credentials' → 'Create Credentials' → 'OAuth 2.0 Client IDs'"
    );
    console.log("5. Choose 'Desktop application' as application type");
    console.log("6. Set redirect URI to: http://localhost:8080");
    console.log("7. Download the client configuration");
    console.log("8. Add to your .env file:");
    console.log("   YOUTUBE_CLIENT_ID=your_client_id");
    console.log("   YOUTUBE_CLIENT_SECRET=your_client_secret");
    console.log("9. Run the setup script to get your refresh token");
    console.log("\nRequired OAuth2 scopes:");
    console.log("- https://www.googleapis.com/auth/youtube.readonly");
    console.log("- https://www.googleapis.com/auth/youtube.force-ssl");
  }
}
