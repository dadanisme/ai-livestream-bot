import { TTSConfig } from "../services/TTSService";
import { AudioStreamConfig } from "../services/AudioStreamService";

// Default TTS Configuration
export const DEFAULT_TTS_CONFIG: TTSConfig = {
  apiKey: process.env.GOOGLE_CLOUD_KEY_FILE!,
  voice: "en-US-Standard-A", // Default voice
  language: "en-US",
  audioFormat: "MP3",
  outputDir: "./audio-output",
  speakingRate: 1.2,
  pitch: 1.5,
  volumeGainDb: 2.0
};

// Default Audio Stream Configuration
export const DEFAULT_AUDIO_STREAM_CONFIG: AudioStreamConfig = {
  outputDir: "./audio-output",
  audioFormat: "MP3",
};

// Alternative TTS configurations for different voices
export const MALE_VOICE_CONFIG = {
  ...DEFAULT_TTS_CONFIG,
  voice: "en-US-Standard-B",
};

export const FEMALE_VOICE_CONFIG = {
  ...DEFAULT_TTS_CONFIG,
  voice: "en-US-Standard-C",
};

export const BRITISH_VOICE_CONFIG = {
  ...DEFAULT_TTS_CONFIG,
  voice: "en-GB-Standard-A",
  language: "en-GB",
};

// Indonesian TTS voices (Google Cloud TTS)
export const ID_MALE_VOICE_CONFIG: TTSConfig = {
  ...DEFAULT_TTS_CONFIG,
  voice: "id-ID-Standard-B",
  language: "id-ID",
};

export const ID_FEMALE_VOICE_CONFIG: TTSConfig = {
  ...DEFAULT_TTS_CONFIG,
  voice: "id-ID-Standard-A",
  language: "id-ID",
};

// Function to get TTS config with custom overrides
export function getTTSConfig(overrides?: Partial<TTSConfig>): TTSConfig {
  return {
    ...DEFAULT_TTS_CONFIG,
    ...overrides,
  };
}

// Function to get audio stream config with custom overrides
export function getAudioStreamConfig(overrides?: Partial<AudioStreamConfig>): AudioStreamConfig {
  return {
    ...DEFAULT_AUDIO_STREAM_CONFIG,
    ...overrides,
  };
} 