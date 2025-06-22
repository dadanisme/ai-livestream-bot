import dotenv from "dotenv";
import { OAuth2Setup } from "./utils/OAuth2Setup";

// Load environment variables
dotenv.config();

async function setupOAuth2() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("❌ Missing OAuth2 credentials in .env file");
    console.log("\nPlease add the following to your .env file:");
    console.log("YOUTUBE_CLIENT_ID=your_client_id");
    console.log("YOUTUBE_CLIENT_SECRET=your_client_secret");
    console.log("\nThen run this script again.");
    process.exit(1);
  }

  try {
    const setup = new OAuth2Setup(clientId, clientSecret);
    await setup.getRefreshToken();
  } catch (error) {
    console.error("❌ OAuth2 setup failed:", error);
    process.exit(1);
  }
}

// Show instructions if no arguments provided
if (process.argv.length === 2) {
  OAuth2Setup.printSetupInstructions();
  console.log("\nTo run the setup, use:");
  console.log("npm run setup-oauth2");
} else {
  setupOAuth2();
}
