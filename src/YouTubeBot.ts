import { google, youtube_v3 } from "googleapis";
import { Logger } from "./utils/Logger";
import { LivestreamMonitor } from "./LivestreamMonitor";
import { BotConfig } from "./types/BotConfig";
import { OAuth2Auth } from "./utils/OAuth2Auth";

export class YouTubeBot {
  private youtube!: youtube_v3.Youtube;
  private monitor!: LivestreamMonitor;
  private logger: Logger;
  private config: BotConfig;
  private oauth2Auth: OAuth2Auth;
  private isRunning: boolean = false;

  constructor(config: BotConfig) {
    this.config = config;
    this.logger = new Logger("YouTubeBot");

    // Initialize OAuth2 authentication
    this.oauth2Auth = new OAuth2Auth(
      config.clientId,
      config.clientSecret,
      config.refreshToken,
      this.logger
    );
  }

  private async initializeYouTubeAPI(): Promise<void> {
    const auth = await this.oauth2Auth.getAuthenticatedClient();
    
    // Initialize YouTube API with OAuth2
    this.youtube = google.youtube({
      version: "v3",
      auth: auth,
    });

    // Initialize livestream monitor
    this.monitor = new LivestreamMonitor(this.youtube, this.config, this.logger);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn("Bot is already running");
      return;
    }

    this.logger.info("Starting YouTube Bot...");

    try {
      // Initialize YouTube API with OAuth2
      await this.initializeYouTubeAPI();

      // Verify API access and channel access
      await this.verifyAccess();

      // Start monitoring livestreams
      await this.monitor.start();

      this.isRunning = true;
      this.logger.info("YouTube Bot started successfully");
    } catch (error) {
      this.logger.error("Failed to start bot:", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn("Bot is not running");
      return;
    }

    this.logger.info("Stopping YouTube Bot...");

    try {
      await this.monitor.stop();
      this.isRunning = false;
      this.logger.info("YouTube Bot stopped successfully");
    } catch (error) {
      this.logger.error("Error stopping bot:", error);
      throw error;
    }
  }

  private async verifyAccess(): Promise<void> {
    try {
      // Test API access by getting channel info
      const response = await this.youtube.channels.list({
        part: ["snippet", "statistics"],
        id: [this.config.channelId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error(`Channel with ID ${this.config.channelId} not found`);
      }

      const channel = response.data.items[0];
      this.logger.info(`Connected to channel: ${channel.snippet?.title}`);
      
      // Verify OAuth2 credentials work
      const isVerified = await this.oauth2Auth.verifyCredentials();
      if (!isVerified) {
        throw new Error("OAuth2 credentials verification failed");
      }
    } catch (error) {
      this.logger.error("Failed to verify API access:", error);
      throw new Error("Invalid OAuth2 credentials or channel ID");
    }
  }

  getStatus(): { isRunning: boolean; channelId: string } {
    return {
      isRunning: this.isRunning,
      channelId: this.config.channelId,
    };
  }
}
