import { Logger } from "./utils/Logger";
import { BotConfig } from "./types/BotConfig";
import { LivestreamInfo, LiveChatMessage } from "./types/YouTubeTypes";
import { youtube_v3 } from "googleapis";
import { AIService } from "./services/AIService";
import { AIVoiceService } from "./services/AIVoiceService";
import { AIResponse } from "./types/AITypes";

export class LivestreamMonitor {
  private youtube: youtube_v3.Youtube;
  private config: BotConfig;
  private logger: Logger;
  private intervalId?: NodeJS.Timeout;
  private chatIntervalId?: NodeJS.Timeout;
  private currentLivestream?: LivestreamInfo;
  private lastChatToken?: string;
  private aiService?: AIService;
  private aiVoiceService?: AIVoiceService;
  private lastMessageTime: number = 0;

  // Interval constants for easier management
  private readonly MESSAGE_COOLDOWN = 3000; // 3 seconds between messages
  private readonly LIVESTREAM_CHECK_INTERVAL = 30000; // 30 seconds
  private readonly CHAT_FETCH_INTERVAL = 10000; // 10 seconds

  constructor(youtube: youtube_v3.Youtube, config: BotConfig, logger: Logger) {
    this.youtube = youtube;
    this.config = config;
    this.logger = logger;

    if (config.enableAI && config.ai) {
      if (config.enableVoice && config.voice) {
        // Use voice service if enabled
        this.aiVoiceService = new AIVoiceService(new AIService(config.ai), {
          enableTTS: config.voice.enableTTS,
          enableAudioOutput: config.voice.enableAudioOutput,
          ttsConfig: config.voice.ttsConfig,
          audioStreamConfig: config.voice.audioStreamConfig,
        });
        this.logger.info("🤖 AI Voice service initialized");
      } else {
        // Use regular AI service
        this.aiService = new AIService(config.ai);
        this.logger.info("🤖 AI service initialized");
      }
    }
  }

  async start(): Promise<void> {
    this.logger.info("Starting livestream monitor...");
    await this.checkLivestreams();
    this.intervalId = setInterval(async () => {
      // await this.checkLivestreams();
      this.logger.info("Checking livestreams...");
    }, this.LIVESTREAM_CHECK_INTERVAL);
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
          this.logger.info("🎥 New livestream detected:", livestream.title);
          await this.onLivestreamStart(livestream);
        }
        this.currentLivestream = livestream;
      } else {
        if (this.currentLivestream) {
          this.logger.info(
            "🏁 Livestream ended:",
            this.currentLivestream.title
          );
          await this.stopChatMonitoring();
          this.currentLivestream = undefined;
        }
      }
    } catch (error) {
      this.logger.error("Error checking livestreams:", error);
    }
  }

  private async getActiveLivestreams(): Promise<LivestreamInfo[]> {
    const broadcastData = await this.youtube.liveBroadcasts.list({
      part: ["snippet", "status"],
      broadcastStatus: "all",
      maxResults: 5,
    });

    if (!broadcastData.data.items || broadcastData.data.items.length === 0) {
      return [];
    }

    return broadcastData.data.items
      .map((broadcast: youtube_v3.Schema$LiveBroadcast) => ({
        id: broadcast.id!,
        title: broadcast.snippet?.title || "",
        description: broadcast.snippet?.description || "",
        status: this.getBroadcastStatus(broadcast.status),
        url: `https://www.youtube.com/watch?v=${broadcast.id}`,
        liveChatId: broadcast.snippet?.liveChatId || undefined,
      }))
      .filter((livestream) => livestream.status !== "ended");
  }

  private getBroadcastStatus(
    status?: youtube_v3.Schema$LiveBroadcastStatus
  ): "upcoming" | "live" | "ended" {
    if (!status) return "upcoming";
    if (status.lifeCycleStatus === "complete") return "ended";
    if (status.lifeCycleStatus === "live") return "live";
    return "upcoming";
  }

  private async onLivestreamStart(livestream: LivestreamInfo): Promise<void> {
    if (livestream.liveChatId && livestream.status === "live") {
      await this.startChatMonitoring(livestream.liveChatId);
    }
  }

  private async startChatMonitoring(liveChatId: string): Promise<void> {
    this.logger.info("💬 Starting chat monitoring...");
    this.lastChatToken = undefined;
    await this.fetchChatMessages(liveChatId);

    this.chatIntervalId = setInterval(async () => {
      await this.fetchChatMessages(liveChatId);
    }, this.CHAT_FETCH_INTERVAL);
  }

  private async stopChatMonitoring(): Promise<void> {
    if (this.chatIntervalId) {
      clearInterval(this.chatIntervalId);
      this.chatIntervalId = undefined;
      this.lastChatToken = undefined;
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

      // Print all messages immediately
      for (const message of messages) {
        const chatMessage: LiveChatMessage = {
          id: message.id!,
          authorName: message.authorDetails?.displayName || "Unknown",
          authorChannelId: message.authorDetails?.channelId || undefined,
          message: message.snippet?.displayMessage || "",
          timestamp: message.snippet?.publishedAt || "",
          type: (message.snippet?.type as any) || "textMessageEvent",
        };
        await this.printChatMessage(chatMessage);
      }

      // Process all eligible messages as a batch with AI
      const eligibleMessages = messages
        .map((message) => ({
          id: message.id!,
          authorName: message.authorDetails?.displayName || "Unknown",
          authorChannelId: message.authorDetails?.channelId || undefined,
          message: message.snippet?.displayMessage || "",
          timestamp: message.snippet?.publishedAt || "",
          type: (message.snippet?.type as any) || "textMessageEvent",
        }))
        .filter(
          (chatMessage) =>
            !chatMessage.authorChannelId ||
            chatMessage.authorChannelId !== this.config.channelId
          // true
        );

      if (eligibleMessages.length > 0) {
        await this.processBatchWithAI(eligibleMessages);
      }

      this.lastChatToken = response.data.nextPageToken ?? undefined;
    } catch (error) {
      this.logger.error("Error fetching chat messages:", error);
      await this.stopChatMonitoring();
    }
  }

  private async sendChatMessage(
    liveChatId: string,
    message: string
  ): Promise<void> {
    // Rate limiting: don't send messages too frequently
    const now = Date.now();
    if (now - this.lastMessageTime < this.MESSAGE_COOLDOWN) {
      this.logger.warn("Rate limit: skipping message send (too soon)");
      return;
    }

    try {
      await this.youtube.liveChatMessages.insert({
        part: ["snippet"],
        requestBody: {
          snippet: {
            liveChatId: liveChatId,
            type: "textMessageEvent",
            textMessageDetails: {
              messageText: message,
            },
          },
        },
      });

      this.lastMessageTime = now;
      this.logger.info(`💬 Sent message: ${message}`);
    } catch (error) {
      this.logger.error("Error sending chat message:", error);
    }
  }

  private async printChatMessage(message: LiveChatMessage): Promise<void> {
    const timestamp = new Date(message.timestamp).toLocaleTimeString();
    const author = message.authorName;
    const text = message.message;

    console.log(`\x1b[32m[${timestamp}] ${author}: ${text}\x1b[0m`);
  }

  private async processBatchWithAI(messages: LiveChatMessage[]): Promise<void> {
    if ((!this.aiService && !this.aiVoiceService) || !this.currentLivestream) {
      return;
    }

    try {
      // Filter out non-text messages
      const textMessages = messages.filter(
        (msg) => msg.type === "textMessageEvent"
      );

      if (textMessages.length === 0) {
        return;
      }

      let aiResponse: AIResponse;

      // Use voice service if available, otherwise use regular AI service
      if (this.aiVoiceService) {
        const result = await this.aiVoiceService.processBatchWithVoice(
          textMessages
        );
        aiResponse = result.aiResponse;
      } else if (this.aiService) {
        // Pass the array of messages directly to the AI service
        aiResponse = await this.aiService.processMessage(textMessages);
      } else {
        return;
      }

      if (
        aiResponse.shouldReply &&
        aiResponse.message &&
        this.currentLivestream.liveChatId
      ) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(
          `\x1b[34m[${timestamp}] 🤖 BOT: ${aiResponse.message}\x1b[0m`
        );
        if (aiResponse.reason) {
          this.logger.debug(`AI Reason: ${aiResponse.reason}`);
        }

        // Actually send the message to YouTube chat
        await this.sendChatMessage(
          this.currentLivestream.liveChatId,
          aiResponse.message
        );
      } else if (aiResponse.reason) {
        this.logger.debug(`AI decided not to reply: ${aiResponse.reason}`);
      }
    } catch (error) {
      this.logger.error("Error processing batch with AI:", error);
    }
  }
}
