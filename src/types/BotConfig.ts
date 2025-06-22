import { AIConfig } from "./AITypes";

export interface BotConfig {
  // OAuth2 credentials
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  
  // Channel configuration
  channelId: string;
  
  // Optional settings
  webhookUrl?: string;
  checkInterval?: number; // in milliseconds, default 30000 (30 seconds)
  maxRetries?: number; // default 3
  
  // AI configuration
  ai?: AIConfig;
  enableAI?: boolean; // default false
  
  // Voice configuration
  enableVoice?: boolean; // default false
  voice?: {
    enableTTS: boolean;
    enableAudioOutput: boolean;
    ttsConfig?: any;
    audioStreamConfig?: any;
  };
} 