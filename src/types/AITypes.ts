export interface AIResponse {
  message: string;
  shouldReply: boolean;
  confidence?: number;
  reason?: string;
}

export interface AIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

export interface ChatContext {
  livestreamTitle: string;
  livestreamDescription: string;
  recentMessages: Array<{
    author: string;
    message: string;
    timestamp: string;
  }>;
  viewerCount?: number;
} 