export enum Language {
  INDONESIAN = "id-ID",
  ENGLISH = "en-US"
}

export enum Voice {
  // Indonesian voices
  INDONESIAN_FEMALE = "id-ID-Standard-A",
  INDONESIAN_MALE = "id-ID-Standard-B",
  INDONESIAN_FEMALE_2 = "id-ID-Standard-C",
  INDONESIAN_MALE_2 = "id-ID-Standard-D",
  
  // English voices
  ENGLISH_FEMALE = "en-US-Standard-A",
  ENGLISH_MALE = "en-US-Standard-B",
  ENGLISH_FEMALE_2 = "en-US-Standard-C",
  ENGLISH_MALE_2 = "en-US-Standard-D",
  ENGLISH_FEMALE_3 = "en-US-Standard-E",
  ENGLISH_MALE_3 = "en-US-Standard-F",
  ENGLISH_FEMALE_4 = "en-US-Standard-G",
  ENGLISH_MALE_4 = "en-US-Standard-H"
}

export enum Gender {
  FEMALE = "FEMALE",
  MALE = "MALE"
}

export interface VoiceConfig {
  language: Language;
  voice: Voice;
  gender: Gender;
  speakingRate: number;
  pitch: number;
  volumeGainDb: number;
}

// Predefined voice configurations
export const VOICE_CONFIGS = {
  // Indonesian configurations
  INDONESIAN_ENERGETIC: {
    language: Language.INDONESIAN,
    voice: Voice.INDONESIAN_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 1.3,
    pitch: 2.0,
    volumeGainDb: 2.0
  },
  
  INDONESIAN_NORMAL: {
    language: Language.INDONESIAN,
    voice: Voice.INDONESIAN_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 1.0,
    pitch: 0.0,
    volumeGainDb: 0.0
  },
  
  INDONESIAN_MALE: {
    language: Language.INDONESIAN,
    voice: Voice.INDONESIAN_MALE,
    gender: Gender.MALE,
    speakingRate: 1.2,
    pitch: 1.5,
    volumeGainDb: 1.0
  },

  // New Indonesian variations
  INDONESIAN_FAST: {
    language: Language.INDONESIAN,
    voice: Voice.INDONESIAN_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 1.5,
    pitch: 1.0,
    volumeGainDb: 1.5
  },

  INDONESIAN_SLOW: {
    language: Language.INDONESIAN,
    voice: Voice.INDONESIAN_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 0.8,
    pitch: -0.5,
    volumeGainDb: 0.5
  },

  INDONESIAN_HIGH_PITCH: {
    language: Language.INDONESIAN,
    voice: Voice.INDONESIAN_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 1.1,
    pitch: 3.0,
    volumeGainDb: 1.0
  },

  INDONESIAN_LOW_PITCH: {
    language: Language.INDONESIAN,
    voice: Voice.INDONESIAN_MALE,
    gender: Gender.MALE,
    speakingRate: 0.9,
    pitch: -1.0,
    volumeGainDb: 1.5
  },

  INDONESIAN_LOUD: {
    language: Language.INDONESIAN,
    voice: Voice.INDONESIAN_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 1.2,
    pitch: 1.0,
    volumeGainDb: 3.0
  },

  INDONESIAN_SOFT: {
    language: Language.INDONESIAN,
    voice: Voice.INDONESIAN_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 0.9,
    pitch: 0.5,
    volumeGainDb: -1.0
  },

  INDONESIAN_MALE_2: {
    language: Language.INDONESIAN,
    voice: Voice.INDONESIAN_MALE_2,
    gender: Gender.MALE,
    speakingRate: 1.1,
    pitch: 0.8,
    volumeGainDb: 1.2
  },

  INDONESIAN_FEMALE_2: {
    language: Language.INDONESIAN,
    voice: Voice.INDONESIAN_FEMALE_2,
    gender: Gender.FEMALE,
    speakingRate: 1.0,
    pitch: 1.2,
    volumeGainDb: 0.8
  },
  
  // English configurations
  ENGLISH_ENERGETIC: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 1.3,
    pitch: 2.0,
    volumeGainDb: 2.0
  },
  
  ENGLISH_NORMAL: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 1.0,
    pitch: 0.0,
    volumeGainDb: 0.0
  },
  
  ENGLISH_MALE: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_MALE,
    gender: Gender.MALE,
    speakingRate: 1.2,
    pitch: 1.5,
    volumeGainDb: 1.0
  },

  // New English variations
  ENGLISH_FAST: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 1.5,
    pitch: 1.0,
    volumeGainDb: 1.5
  },

  ENGLISH_SLOW: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 0.8,
    pitch: -0.5,
    volumeGainDb: 0.5
  },

  ENGLISH_HIGH_PITCH: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 1.1,
    pitch: 3.0,
    volumeGainDb: 1.0
  },

  ENGLISH_LOW_PITCH: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_MALE,
    gender: Gender.MALE,
    speakingRate: 0.9,
    pitch: -1.0,
    volumeGainDb: 1.5
  },

  ENGLISH_LOUD: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 1.2,
    pitch: 1.0,
    volumeGainDb: 3.0
  },

  ENGLISH_SOFT: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_FEMALE,
    gender: Gender.FEMALE,
    speakingRate: 0.9,
    pitch: 0.5,
    volumeGainDb: -1.0
  },

  ENGLISH_MALE_2: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_MALE_2,
    gender: Gender.MALE,
    speakingRate: 1.1,
    pitch: 0.8,
    volumeGainDb: 1.2
  },

  ENGLISH_FEMALE_2: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_FEMALE_2,
    gender: Gender.FEMALE,
    speakingRate: 1.0,
    pitch: 1.2,
    volumeGainDb: 0.8
  },

  ENGLISH_MALE_3: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_MALE_3,
    gender: Gender.MALE,
    speakingRate: 1.0,
    pitch: 0.5,
    volumeGainDb: 1.0
  },

  ENGLISH_FEMALE_3: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_FEMALE_3,
    gender: Gender.FEMALE,
    speakingRate: 1.1,
    pitch: 1.5,
    volumeGainDb: 1.5
  },

  ENGLISH_MALE_4: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_MALE_4,
    gender: Gender.MALE,
    speakingRate: 0.9,
    pitch: -0.5,
    volumeGainDb: 1.8
  },

  ENGLISH_FEMALE_4: {
    language: Language.ENGLISH,
    voice: Voice.ENGLISH_FEMALE_4,
    gender: Gender.FEMALE,
    speakingRate: 1.2,
    pitch: 0.8,
    volumeGainDb: 1.0
  }
} as const;

// Helper function to get voice config
export function getVoiceConfig(configName: keyof typeof VOICE_CONFIGS): VoiceConfig {
  return VOICE_CONFIGS[configName];
}

// Helper function to list available voices
export function getAvailableVoices(): { [key: string]: VoiceConfig } {
  return VOICE_CONFIGS;
}

// Helper function to get voices by language
export function getVoicesByLanguage(language: Language): VoiceConfig[] {
  return Object.values(VOICE_CONFIGS).filter(config => config.language === language);
}

// Helper function to get voices by personality type
export function getVoicesByPersonality(personality: 'energetic' | 'normal' | 'fast' | 'slow' | 'high_pitch' | 'low_pitch' | 'loud' | 'soft'): VoiceConfig[] {
  return Object.values(VOICE_CONFIGS).filter(config => {
    const configName = Object.keys(VOICE_CONFIGS).find(key => VOICE_CONFIGS[key as keyof typeof VOICE_CONFIGS] === config);
    return configName?.toLowerCase().includes(personality);
  });
} 