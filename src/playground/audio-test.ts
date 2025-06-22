import * as dotenv from "dotenv";
import { TTSService } from "../services/TTSService";
import { Logger } from "../utils/Logger";
import { getVoiceConfig, VOICE_CONFIGS } from "../config/voiceConfig";

// Load environment variables
dotenv.config();

const logger = new Logger("AudioTest");

async function testAudio() {
  try {
    logger.info("🎤 Starting Audio Test...");

    // Check if required environment variables are set
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      throw new Error("GOOGLE_CLOUD_PROJECT_ID not set in .env file");
    }
    if (!process.env.GOOGLE_CLOUD_KEY_FILE) {
      throw new Error("GOOGLE_CLOUD_KEY_FILE not set in .env file");
    }

    // Choose which voice configuration to test
    // Available options: INDONESIAN_ENERGETIC, INDONESIAN_NORMAL, INDONESIAN_MALE, ENGLISH_ENERGETIC, ENGLISH_NORMAL, ENGLISH_MALE
    const voiceConfig = getVoiceConfig("INDONESIAN_ENERGETIC");
    
    logger.info(`🎤 Testing voice: ${voiceConfig.voice} (${voiceConfig.language})`);
    logger.info(`⚙️ Settings: Speed=${voiceConfig.speakingRate}x, Pitch=${voiceConfig.pitch}, Volume=${voiceConfig.volumeGainDb}dB`);

    // Initialize TTS service with the selected voice config
    const ttsService = new TTSService({
      apiKey: process.env.GOOGLE_CLOUD_KEY_FILE,
      audioFormat: "MP3",
      outputDir: "./audio_output",
    //   voice: voiceConfig.voice,
    //   language: voiceConfig.language,
    //   speakingRate: voiceConfig.speakingRate,
    //   pitch: voiceConfig.pitch,
    //   volumeGainDb: voiceConfig.volumeGainDb,
      ...VOICE_CONFIGS.INDONESIAN_MALE
    });

    logger.info("✅ TTS Service initialized successfully");

    // Test messages based on language
    const testMessages = voiceConfig.language === "id-ID" ? [
      "Halo semuanya! Selamat datang di livestream!",
      "Wah, chat kalian sangat ramai hari ini!",
      "Terima kasih sudah menonton dan berinteraksi!",
      "Ini adalah test suara AI yang lebih cepat dan energetik!",
      "Bagaimana menurut kalian dengan suara saya?",
    ] : [
      "Hello everyone! Welcome to the livestream!",
      "Wow, your chat is so lively today!",
      "Thank you for watching and interacting!",
      "This is a test of the faster and more energetic AI voice!",
      "What do you think of my voice?",
    ];

    logger.info("🎵 Generating test audio files...");

    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      logger.info(`\n📝 Test ${i + 1}: "${message}"`);
      
      try {
        const audioPath = await ttsService.textToSpeech(message, `test_${i + 1}.mp3`);
        logger.info(`✅ Audio generated: ${audioPath}`);
        
        // Play the audio file
        const { exec } = require("child_process");
        exec(`afplay "${audioPath}"`, (err: any) => {
          if (err) {
            logger.error(`❌ Error playing audio: ${err.message}`);
          } else {
            logger.info(`🔊 Audio played successfully`);
          }
        });

        // Wait a bit between each test
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        logger.error(`❌ Error generating audio for test ${i + 1}:`, error);
      }
    }

    logger.info("\n🎉 Audio test completed!");
    logger.info("📁 Check the ./audio_output folder for generated files");
    logger.info("\n💡 To test different voices, change the voiceConfig in this file:");
    logger.info("   Available options: INDONESIAN_ENERGETIC, INDONESIAN_NORMAL, INDONESIAN_MALE, ENGLISH_ENERGETIC, ENGLISH_NORMAL, ENGLISH_MALE");

  } catch (error) {
    logger.error("❌ Audio test failed:", error);
    process.exit(1);
  }
}

// Run the test
testAudio(); 