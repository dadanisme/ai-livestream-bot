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
} 