import { AIService } from "./AIService";
import { TTSService } from "./TTSService";
import { AudioStreamService } from "./AudioStreamService";
import { Logger } from "../utils/Logger";
import { LiveChatMessage } from "../types/YouTubeTypes";
import { exec } from "child_process";

export interface AIVoiceConfig {
  enableTTS: boolean;
  enableAudioOutput: boolean;
  ttsConfig: any;
  audioStreamConfig: any;
}

export class AIVoiceService {
  private aiService: AIService;
  private ttsService?: TTSService;
  private audioStreamService?: AudioStreamService;
  private logger: Logger;
  private config: AIVoiceConfig;

  constructor(aiService: AIService, config: AIVoiceConfig) {
    this.aiService = aiService;
    this.config = config;
    this.logger = new Logger("AIVoiceService");

    // Initialize TTS service if enabled
    if (config.enableTTS) {
      this.ttsService = new TTSService({
        apiKey: config.ttsConfig.keyFilename,
        voice: config.ttsConfig.voice.name,
        language: config.ttsConfig.voice.languageCode,
        audioFormat: config.ttsConfig.audioConfig.audioEncoding,
        outputDir: config.audioStreamConfig.outputPath,
        speakingRate: config.ttsConfig.audioConfig.speakingRate,
        pitch: config.ttsConfig.audioConfig.pitch,
        volumeGainDb: config.ttsConfig.audioConfig.volumeGainDb
      });
      this.logger.info("🎤 TTS service initialized");
    }

    // Initialize audio stream service if enabled
    if (config.enableAudioOutput) {
      this.audioStreamService = new AudioStreamService(config.audioStreamConfig);
      this.logger.info("🔊 Audio stream service initialized");
    }
  }

  /**
   * Process message with AI and generate audio response
   */
  async processMessageWithVoice(
    messages: LiveChatMessage[]
  ): Promise<{ aiResponse: any; audioPath?: string }> {
    try {
      // Get AI response
      const aiResponse = await this.aiService.processMessage(messages);

      // Generate audio if TTS is enabled and AI decided to reply
      let audioPath: string | undefined;
      if (this.ttsService && aiResponse.shouldReply && aiResponse.message) {
        try {
          audioPath = await this.ttsService.textToSpeech(aiResponse.message);
          this.logger.info(`🎤 Generated audio: ${audioPath}`);
          // Play the audio file locally (macOS: afplay)
          exec(`afplay "${audioPath}"`, (err) => {
            if (err) {
              this.logger.error("Error playing audio:", err);
            } else {
              this.logger.info("Audio played successfully");
            }
          });
        } catch (error) {
          this.logger.error("Error generating TTS audio:", error);
        }
      }

      return { aiResponse, audioPath };
    } catch (error) {
      this.logger.error("Error processing message with voice:", error);
      throw error;
    }
  }

  /**
   * Process batch of messages with AI and generate audio response
   */
  async processBatchWithVoice(
    messages: LiveChatMessage[]
  ): Promise<{ aiResponse: any; audioPath?: string }> {
    try {
      // Filter out non-text messages
      const textMessages = messages.filter(msg => msg.type === "textMessageEvent");

      if (textMessages.length === 0) {
        return { aiResponse: { shouldReply: false, message: "", confidence: 0, reason: "No valid messages" } };
      }

      // Process with AI and generate audio
      return await this.processMessageWithVoice(textMessages);
    } catch (error) {
      this.logger.error("Error processing batch with voice:", error);
      throw error;
    }
  }

  /**
   * Get available voices (if TTS is enabled)
   */
  async getAvailableVoices(languageCode?: string): Promise<any[]> {
    if (!this.ttsService) {
      this.logger.warn("TTS service not enabled");
      return [];
    }

    try {
      return await this.ttsService.getAvailableVoices(languageCode);
    } catch (error) {
      this.logger.error("Error getting available voices:", error);
      return [];
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIVoiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AIVoiceConfig {
    return { ...this.config };
  }
}
