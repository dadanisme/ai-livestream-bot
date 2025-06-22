import { Chat, GoogleGenAI, Type } from "@google/genai";
import { Logger } from "../utils/Logger";
import { AIConfig, AIResponse, ChatContext } from "../types/AITypes";
import { LiveChatMessage } from "../types/YouTubeTypes";

export class AIService {
  private logger: Logger;
  private config: AIConfig;
  private recentMessages: LiveChatMessage[] = [];
  private maxMessageHistory: number = 10;
  private chat: Chat;

  // Schema for structured AI response
  private readonly responseSchema = {
    description: "AI response to a YouTube livestream chat message",
    type: Type.OBJECT,
    properties: {
      shouldReply: {
        type: Type.BOOLEAN,
        description: "Whether the AI should reply to this message",
        nullable: false,
      },
      confidence: {
        type: Type.NUMBER,
        description: "Confidence level of the response (0-1)",
        nullable: false,
      },
      message: {
        type: Type.STRING,
        description:
          "The response message to send (empty if shouldReply is false)",
        nullable: false,
      },
      reason: {
        type: Type.STRING,
        description: "Brief reason for the decision to reply or not reply",
        nullable: false,
      },
    },
    required: ["shouldReply", "confidence", "message", "reason"],
  };

  constructor(config: AIConfig) {
    this.config = config;
    this.logger = new Logger("AIService");

    const genAI = new GoogleGenAI({
      apiKey: config.apiKey,
    });

    // Enhanced system prompt with livestream context and response format
    const enhancedSystemPrompt = `${this.config.systemPrompt}

You are an AI assistant for a YouTube livestream chat. Your role is to:
- Analyze incoming chat messages
- Determine if a response is needed
- Provide natural, engaging responses when appropriate
- Keep responses concise and relevant to the livestream
- Be friendly and supportive to the community

IMPORTANT: Always respond with a JSON object containing:
- shouldReply: boolean (true if you should respond, false otherwise)
- confidence: number (0-1, how confident you are in your decision)
- message: string (your response message if shouldReply is true, empty string otherwise)
- reason: string (brief explanation of your decision)

The livestream context will be provided in the conversation as needed.`;

    // Initialize Google Generative AI
    this.chat = genAI.chats.create({
      model: this.config.model,
      config: {
        responseMimeType: "application/json",
        responseSchema: this.responseSchema,
        maxOutputTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        systemInstruction: enhancedSystemPrompt,
      },
    });
  }

  /**
   * Process chat messages and determine if/how to respond
   */
  async processMessage(messages: LiveChatMessage[]): Promise<AIResponse> {
    try {
      this.logger.debug(`Processing ${messages.length} messages from chat`);

      // Add messages to recent history
      messages.forEach((message) => this.addToMessageHistory(message));

      // Send the messages as an array to the chat session
      // The chat session maintains context automatically
      const result = await this.chat.sendMessage({
        message: messages.map((msg) => `${msg.authorName}: ${msg.message}`),
      });

      const responseText = result?.text || "";

      // Parse the structured JSON response
      const aiResponse = this.parseStructuredResponse(responseText);

      this.logger.debug(`AI Response: ${JSON.stringify(aiResponse)}`);
      return aiResponse;
    } catch (error) {
      this.logger.error("Error processing messages with AI:", error);
      return {
        message: "",
        shouldReply: false,
        confidence: 0,
        reason: "Error processing messages",
      };
    }
  }

  /**
   * Parse the structured JSON response
   */
  private parseStructuredResponse(responseText: string): AIResponse {
    try {
      const parsed = JSON.parse(responseText);

      return {
        message: parsed.message || "",
        shouldReply: parsed.shouldReply || false,
        confidence: parsed.confidence || 0,
        reason: parsed.reason || "No reason provided",
      };
    } catch (error) {
      this.logger.error("Error parsing structured response:", error);
      return {
        message: "",
        shouldReply: false,
        confidence: 0,
        reason: "Failed to parse AI response",
      };
    }
  }

  /**
   * Add message to recent history
   */
  private addToMessageHistory(message: LiveChatMessage): void {
    this.recentMessages.push(message);

    // Keep only the most recent messages
    if (this.recentMessages.length > this.maxMessageHistory) {
      this.recentMessages = this.recentMessages.slice(-this.maxMessageHistory);
    }
  }

  /**
   * Get current AI configuration
   */
  getConfig(): AIConfig {
    return { ...this.config };
  }

  /**
   * Update AI configuration
   */
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Update livestream context in the chat session
   */
  async updateLivestreamContext(context: ChatContext): Promise<void> {
    try {
      const contextMessage = `Livestream Context Update:
Title: ${context.livestreamTitle}
Description: ${context.livestreamDescription}
Viewer Count: ${context.viewerCount || "Unknown"}

Please use this context for future responses.`;

      await this.chat.sendMessage({ message: contextMessage });
      this.logger.debug("Updated livestream context in chat session");
    } catch (error) {
      this.logger.error("Error updating livestream context:", error);
    }
  }
}
