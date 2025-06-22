import * as dotenv from "dotenv";
import { TTSService } from "../services/TTSService";
import { Logger } from "../utils/Logger";
import { getVoiceConfig, VOICE_CONFIGS, getVoicesByLanguage, Language } from "../config/voiceConfig";

// Load environment variables
dotenv.config();

const logger = new Logger("VoiceComparisonTest");

async function testVoiceComparison() {
  try {
    logger.info("🎤 Starting Voice Comparison Test...");

    // Check if required environment variables are set
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      throw new Error("GOOGLE_CLOUD_PROJECT_ID not set in .env file");
    }
    if (!process.env.GOOGLE_CLOUD_KEY_FILE) {
      throw new Error("GOOGLE_CLOUD_KEY_FILE not set in .env file");
    }

    // Test configurations - you can modify this array to test different voices
    const testConfigs = [
      "INDONESIAN_ENERGETIC",
      "INDONESIAN_NORMAL", 
      "INDONESIAN_FAST",
      "INDONESIAN_SLOW",
      "INDONESIAN_HIGH_PITCH",
      "INDONESIAN_LOW_PITCH",
      "INDONESIAN_LOUD",
      "INDONESIAN_SOFT",
      "ENGLISH_ENERGETIC",
      "ENGLISH_NORMAL",
      "ENGLISH_FAST",
      "ENGLISH_SLOW",
      "ENGLISH_HIGH_PITCH",
      "ENGLISH_LOW_PITCH",
      "ENGLISH_LOUD",
      "ENGLISH_SOFT"
    ];

    logger.info(`🎵 Testing ${testConfigs.length} voice configurations...`);

    for (let i = 0; i < testConfigs.length; i++) {
      const configName = testConfigs[i];
      const voiceConfig = getVoiceConfig(configName as keyof typeof VOICE_CONFIGS);
      
      logger.info(`\n🎤 Test ${i + 1}/${testConfigs.length}: ${configName}`);
      logger.info(`   Language: ${voiceConfig.language}`);
      logger.info(`   Voice: ${voiceConfig.voice}`);
      logger.info(`   Settings: Speed=${voiceConfig.speakingRate}x, Pitch=${voiceConfig.pitch}, Volume=${voiceConfig.volumeGainDb}dB`);

      // Initialize TTS service with the current voice config
      const ttsService = new TTSService({
        apiKey: process.env.GOOGLE_CLOUD_KEY_FILE,
        voice: voiceConfig.voice,
        language: voiceConfig.language,
        audioFormat: "MP3",
        outputDir: "./audio_output",
        speakingRate: voiceConfig.speakingRate,
        pitch: voiceConfig.pitch,
        volumeGainDb: voiceConfig.volumeGainDb
      });

      // Test message based on language
      const testMessage = voiceConfig.language === Language.INDONESIAN 
        ? "Halo! Ini adalah test suara untuk livestream bot."
        : "Hello! This is a voice test for the livestream bot.";

      try {
        const audioPath = await ttsService.textToSpeech(testMessage, `${configName.toLowerCase()}_test.mp3`);
        logger.info(`   ✅ Audio generated: ${audioPath}`);
        
        // Play the audio file
        const { exec } = require("child_process");
        exec(`afplay "${audioPath}"`, (err: any) => {
          if (err) {
            logger.error(`   ❌ Error playing audio: ${err.message}`);
          } else {
            logger.info(`   🔊 Audio played successfully`);
          }
        });

        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 4000));
        
      } catch (error) {
        logger.error(`   ❌ Error generating audio:`, error);
      }
    }

    logger.info("\n🎉 Voice comparison test completed!");
    logger.info("📁 Check the ./audio_output folder for all generated files");
    logger.info("\n💡 Files generated:");
    testConfigs.forEach(config => {
      logger.info(`   - ${config.toLowerCase()}_test.mp3`);
    });

  } catch (error) {
    logger.error("❌ Voice comparison test failed:", error);
    process.exit(1);
  }
}

// Run the test
testVoiceComparison(); 