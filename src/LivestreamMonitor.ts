import { Logger } from "./utils/Logger";
import { BotConfig } from "./types/BotConfig";
import { LivestreamInfo, LiveChatMessage } from "./types/YouTubeTypes";
import { youtube_v3 } from "googleapis";
import axios, { AxiosError } from "axios";

// Webhook payload types
export type WebhookPayload =
  | { event: "livestream_start"; livestream: LivestreamInfo }
  | { event: "livestream_status_change"; livestream: LivestreamInfo }
  | { event: "livestream_end"; livestream: LivestreamInfo };

export class LivestreamMonitor {
  private youtube: youtube_v3.Youtube;
  private config: BotConfig;
  private logger: Logger;
  private intervalId?: NodeJS.Timeout;
  private chatIntervalId?: NodeJS.Timeout;
  private currentLivestream?: LivestreamInfo;
  private checkInterval: number;
  private maxRetries: number;
  private retryCount: number = 0;
  private lastChatToken?: string;

  constructor(youtube: youtube_v3.Youtube, config: BotConfig, logger: Logger) {
    this.youtube = youtube;
    this.config = config;
    this.logger = logger;
    this.checkInterval = config.checkInterval || 30000; // 30 seconds default
    this.maxRetries = config.maxRetries || 3;
  }

  async start(): Promise<void> {
    this.logger.info("Starting livestream monitor...");
    await this.checkLivestreams();
    this.intervalId = setInterval(async () => {
      await this.checkLivestreams();
    }, this.checkInterval);
    this.logger.info(
      `Livestream monitor started. Checking every ${
        this.checkInterval / 1000
      } seconds`
    );
  }

  async stop(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    if (this.chatIntervalId) {
      clearInterval(this.chatIntervalId);
      this.chatIntervalId = undefined;
    }
    this.logger.info("Livestream monitor stopped");
  }

  private async checkLivestreams(): Promise<void> {
    try {
      const livestreams = await this.getActiveLivestreams();

      if (livestreams.length > 0) {
        const livestream = livestreams[0];
        if (
          !this.currentLivestream ||
          this.currentLivestream.id !== livestream.id
        ) {
          this.logger.info("New livestream detected!", livestream);
          await this.onLivestreamStart(livestream);
        } else if (this.currentLivestream.status !== livestream.status) {
          this.logger.info("Livestream status changed", {
            from: this.currentLivestream.status,
            to: livestream.status,
            livestream,
          });
          await this.onLivestreamStatusChange(livestream);
        }
        this.currentLivestream = livestream;
      } else {
        if (this.currentLivestream) {
          this.logger.info("Livestream ended", this.currentLivestream);
          await this.onLivestreamEnd(this.currentLivestream);
          this.currentLivestream = undefined;
        }
      }
      this.retryCount = 0;
    } catch (error: unknown) {
      const err = error as AxiosError;
      console.log(err.response?.data)
      this.retryCount++;
      this.logger.error(
        `Error checking livestreams (attempt ${this.retryCount}/${this.maxRetries}):`,
        error
      );
      if (this.retryCount >= this.maxRetries) {
        this.logger.error("Max retries reached. Stopping monitor.");
        await this.stop();
      }
    }
  }

  private async getActiveLivestreams(): Promise<LivestreamInfo[]> {
    try {
      const broadcastData = await this.youtube.liveBroadcasts.list({
        part: ["snippet", "status", "contentDetails"],
        broadcastStatus: "all",
        maxResults: 5,
      });

      if (!broadcastData.data.items || broadcastData.data.items.length === 0) {
        return [];
      }

      return broadcastData.data.items
        .map((broadcast: youtube_v3.Schema$LiveBroadcast) => {
          const snippet = broadcast.snippet;
          const status = broadcast.status;
          const contentDetails = broadcast.contentDetails;

          return {
            id: broadcast.id!,
            title: snippet?.title || "",
            description: snippet?.description || "",
            status: this.getBroadcastStatus(status),
            scheduledStartTime: snippet?.scheduledStartTime ?? undefined,
            actualStartTime: snippet?.actualStartTime ?? undefined,
            actualEndTime: snippet?.actualEndTime ?? undefined,
            viewerCount: undefined,
            concurrentViewers: undefined,
            url: `https://www.youtube.com/watch?v=${broadcast.id}`,
            liveChatId: snippet?.liveChatId ?? undefined,
          };
        })
        .filter((livestream) => livestream.status !== "ended");
    } catch (error) {
      this.logger.error("Error fetching livestreams:", error);
      throw error;
    }
  }

  private getBroadcastStatus(
    status?: youtube_v3.Schema$LiveBroadcastStatus
  ): "upcoming" | "live" | "ended" {
    if (!status) return "upcoming";

    if (status.lifeCycleStatus === "complete") {
      return "ended";
    } else if (status.lifeCycleStatus === "live") {
      return "live";
    } else {
      return "upcoming";
    }
  }

  private async onLivestreamStart(livestream: LivestreamInfo): Promise<void> {
    this.logger.info("🎥 Livestream started!", {
      title: livestream.title,
      url: livestream.url,
      status: livestream.status,
    });

    // Start monitoring live chat if available
    if (livestream.liveChatId && livestream.status === "live") {
      await this.startChatMonitoring(livestream.liveChatId);
    }

    if (this.config.webhookUrl) {
      await this.sendWebhook({
        event: "livestream_start",
        livestream,
      });
    }
  }

  private async onLivestreamStatusChange(
    livestream: LivestreamInfo
  ): Promise<void> {
    this.logger.info("📊 Livestream status changed", {
      title: livestream.title,
      status: livestream.status,
      viewerCount: livestream.viewerCount,
    });

    // Start/stop chat monitoring based on status
    if (livestream.liveChatId && livestream.status === "live") {
      await this.startChatMonitoring(livestream.liveChatId);
    } else if (livestream.status === "ended") {
      await this.stopChatMonitoring();
    }

    if (this.config.webhookUrl) {
      await this.sendWebhook({
        event: "livestream_status_change",
        livestream,
      });
    }
  }

  private async onLivestreamEnd(livestream: LivestreamInfo): Promise<void> {
    this.logger.info("🏁 Livestream ended", {
      title: livestream.title,
      duration: this.calculateDuration(
        livestream.actualStartTime,
        livestream.actualEndTime
      ),
    });

    // Stop chat monitoring
    await this.stopChatMonitoring();

    if (this.config.webhookUrl) {
      await this.sendWebhook({
        event: "livestream_end",
        livestream,
      });
    }
  }

  private async startChatMonitoring(liveChatId: string): Promise<void> {
    this.logger.info("💬 Starting live chat monitoring...");
    this.lastChatToken = undefined;

    // Verify the livestream is still active before starting chat monitoring
    if (!(await this.isLivestreamActive(liveChatId))) {
      this.logger.warn("Livestream is no longer active or chat is inaccessible. Skipping chat monitoring.");
      return;
    }

    this.logger.info("Chat access verified, starting monitoring...");

    // Initial chat fetch
    await this.fetchChatMessages(liveChatId);

    // Set up periodic chat polling (every 5 seconds)
    this.chatIntervalId = setInterval(async () => {
      await this.fetchChatMessages(liveChatId);
    }, 5000);
  }

  private async isLivestreamActive(liveChatId: string): Promise<boolean> {
    try {
      // Try to get the current livestream status
      const livestreams = await this.getActiveLivestreams();
      const currentLivestream = livestreams.find(ls => ls.liveChatId === liveChatId);
      
      if (!currentLivestream) {
        this.logger.warn(`No active livestream found for chat ID: ${liveChatId}`);
        return false;
      }

      if (currentLivestream.status !== 'live') {
        this.logger.warn(`Livestream status is '${currentLivestream.status}', not 'live'`);
        return false;
      }

      // Additional check: verify the chat ID is actually valid
      if (!(await this.isValidChatId(liveChatId))) {
        this.logger.warn(`Chat ID ${liveChatId} appears to be invalid or inaccessible`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error("Error checking livestream status:", error);
      return false;
    }
  }

  private async isValidChatId(liveChatId: string): Promise<boolean> {
    try {
      // Try to get chat details to verify it's valid
      const response = await this.youtube.liveChatMessages.list({
        liveChatId: liveChatId,
        part: ["snippet"],
        maxResults: 1,
      });
      
      // If we get here, the chat ID is valid
      return true;
    } catch (error: any) {
      if (error.code === 404) {
        this.logger.warn(`Chat ID ${liveChatId} not found`);
        return false;
      } else if (error.code === 403) {
        this.logger.warn(`No permission to access chat ID ${liveChatId}`);
        return false;
      } else {
        this.logger.warn(`Chat ID ${liveChatId} validation failed:`, error.response?.data?.error?.message || error.message);
        return false;
      }
    }
  }

  private async stopChatMonitoring(): Promise<void> {
    if (this.chatIntervalId) {
      clearInterval(this.chatIntervalId);
      this.chatIntervalId = undefined;
      this.lastChatToken = undefined;
      this.logger.info("💬 Live chat monitoring stopped");
    }
  }

  private async fetchChatMessages(liveChatId: string): Promise<void> {
    try {
      const response = await this.youtube.liveChatMessages.list({
        liveChatId: liveChatId,
        part: ["snippet", "authorDetails"],
        maxResults: 200,
        pageToken: this.lastChatToken,
      });

      const messages = response.data.items || [];

      // Print new messages
      messages.forEach((message: youtube_v3.Schema$LiveChatMessage) => {
        const chatMessage: LiveChatMessage = {
          id: message.id!,
          authorName: message.authorDetails?.displayName || "Unknown",
          authorChannelId: message.authorDetails?.channelId ?? undefined,
          message: message.snippet?.displayMessage || "",
          timestamp: message.snippet?.publishedAt || "",
          type: (message.snippet?.type as any) || "textMessageEvent",
          displayMessage: message.snippet?.displayMessage ?? undefined,
        };

        // Print the message
        this.printChatMessage(chatMessage);
      });

      // Update next page token
      this.lastChatToken = response.data.nextPageToken ?? undefined;
    } catch (error: any) {
      console.log("Chat error details:", error.response?.data?.error?.errors);
      
      // Check if it's a page token error
      if (error.code === 400 && error.errors?.[0]?.reason === 'pageTokenInvalid') {
        this.logger.warn("Invalid page token detected, stopping chat monitoring.");
        await this.stopChatMonitoring();
        return; // Don't retry, just stop
      } else if (error.code === 403) {
        // Permission denied - might need to refresh OAuth token
        this.logger.error("Permission denied accessing live chat. Check OAuth2 credentials.");
        await this.stopChatMonitoring();
      } else if (error.code === 404) {
        // Live chat not found - livestream might have ended
        this.logger.warn("Live chat not found. Livestream may have ended.");
        await this.stopChatMonitoring();
      } else {
        this.logger.error("Error fetching chat messages:", error);
        // For any other error, stop monitoring to prevent spam
        await this.stopChatMonitoring();
      }
    }
  }

  private printChatMessage(message: LiveChatMessage): void {
    const timestamp = new Date(message.timestamp).toLocaleTimeString();
    const author = message.authorName;
    const text = message.message;

    // Color-coded output based on message type
    switch (message.type) {
      case "superChatEvent":
        console.log(`\x1b[33m[${timestamp}] 💰 ${author}: ${text}\x1b[0m`);
        break;
      case "newSponsorEvent":
        console.log(
          `\x1b[35m[${timestamp}] ⭐ ${author} became a member!\x1b[0m`
        );
        break;
      case "memberMilestoneEvent":
        console.log(`\x1b[36m[${timestamp}] 🎉 ${author} milestone!\x1b[0m`);
        break;
      default:
        console.log(`\x1b[32m[${timestamp}] ${author}: ${text}\x1b[0m`);
    }
  }

  private calculateDuration(startTime?: string, endTime?: string): string {
    if (!startTime || !endTime) return "Unknown";
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  private async sendWebhook(data: WebhookPayload): Promise<void> {
    if (!this.config.webhookUrl) return;
    try {
      await axios.post(this.config.webhookUrl, data, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      this.logger.error("Error sending webhook:", error);
    }
  }
}
