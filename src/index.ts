import dotenv from "dotenv";
import { YouTubeBot } from "./YouTubeBot";
import { Logger } from "./utils/Logger";

// Load environment variables
dotenv.config();

const logger = new Logger("Main");

async function main() {
  try {
    logger.info("Starting YouTube Livestream Bot...");

    const bot = new YouTubeBot({
      clientId: process.env.YOUTUBE_CLIENT_ID!,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET!,
      refreshToken: process.env.YOUTUBE_REFRESH_TOKEN!,
      channelId: process.env.CHANNEL_ID!,
      webhookUrl: process.env.WEBHOOK_URL,
      maxRetries: 1,
    });

    await bot.start();

    logger.info("Bot started successfully!");

    // Keep the process running
    process.on("SIGINT", async () => {
      logger.info("Shutting down bot...");
      await bot.stop();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start bot:", error);
    process.exit(1);
  }
}

main();
