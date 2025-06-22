import * as dotenv from "dotenv";
import { YouTubeBot } from "./YouTubeBot";
import { Logger } from "./utils/Logger";
import { getAIConfig, HOLLOW_KNIGHT_PROMPT } from "./config/aiConfig";
import { getVoiceConfig } from "./config/voiceConfig";

// Load environment variables
dotenv.config();

const logger = new Logger("Main");

async function main() {
  try {
    logger.info("Starting YouTube Livestream Bot...");

    // Choose your AI configuration:
    // - getAIConfig() - Default general purpose
    // - GAMING_AI_CONFIG - Optimized for gaming streams
    // - EDUCATIONAL_AI_CONFIG - Optimized for educational content
    // - getAIConfig({ custom: "settings" }) - Custom configuration
    
    // Choose your voice configuration:
    // - INDONESIAN_ENERGETIC: Fast, high-pitched Indonesian female
    // - INDONESIAN_NORMAL: Normal speed Indonesian female
    // - INDONESIAN_MALE: Indonesian male voice
    // - ENGLISH_ENERGETIC: Fast, high-pitched English female
    // - ENGLISH_NORMAL: Normal speed English female
    // - ENGLISH_MALE: English male voice
    const voiceConfig = getVoiceConfig("INDONESIAN_MALE");

    const bot = new YouTubeBot({
      clientId: process.env.YOUTUBE_CLIENT_ID!,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET!,
      refreshToken: process.env.YOUTUBE_REFRESH_TOKEN!,
      channelId: process.env.CHANNEL_ID!,
      webhookUrl: process.env.WEBHOOK_URL,
      maxRetries: 1,
      // AI Configuration
      enableAI: true,
      ai: getAIConfig({
        systemPrompt: HOLLOW_KNIGHT_PROMPT,
      }),
      // Voice Configuration
      enableVoice: true,
      voice: {
        enableTTS: true,
        enableAudioOutput: true,
        ttsConfig: {
          // Google Cloud TTS configuration
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
          keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
          voice: {
            languageCode: voiceConfig.language,
            name: voiceConfig.voice,
            ssmlGender: voiceConfig.gender,
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: voiceConfig.speakingRate,
            pitch: voiceConfig.pitch,
            volumeGainDb: voiceConfig.volumeGainDb,
          },
        },
        audioStreamConfig: {
          // Audio streaming configuration
          outputPath: "./audio_output",
          format: "mp3",
          sampleRate: 22050,
        },
      },
    });

    await bot.start();

    logger.info("Bot started successfully!");
    logger.info(
      `🎤 Using voice: ${voiceConfig.voice} (${voiceConfig.language})`
    );

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
