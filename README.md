# AI Livestream Bot 🎤🤖

A powerful YouTube livestream bot built with TypeScript that monitors live chat, generates AI responses using Google's Gemini AI, and speaks them using Google Cloud Text-to-Speech. Perfect for content creators who want to engage with their audience while focusing on their content.

## ✨ Features

- **🤖 AI-Powered Responses**: Uses Google's Gemini AI to generate contextual, engaging responses to live chat messages
- **🎤 Text-to-Speech**: Converts AI responses to natural-sounding speech using Google Cloud TTS
- **🔊 Local Audio Playback**: Plays generated audio locally (perfect for mixing with OBS, Streamlabs, or other streaming software)
- **💬 Smart Chat Processing**: Processes multiple chat messages together for more contextual and relevant responses
- **⚡ Rate Limiting**: Prevents spam by intelligently limiting message frequency
- **🌍 Multi-Language Support**: Supports both Indonesian and English voices with various personalities
- **🎮 Gaming Optimized**: Special AI configurations for gaming streams with game-specific knowledge
- **📚 Educational Content**: Dedicated AI personalities for educational and tutorial content
- **🔧 Highly Configurable**: Easy customization of AI behavior, voice settings, and response patterns

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- YouTube OAuth2 credentials
- Google Cloud project with Text-to-Speech API enabled
- Gemini API key (optional, for AI responses)

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-livestream-bot

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit the .env file with your credentials
nano .env
```

### 3. Configuration

Configure your `.env` file with the following variables:

```env
# YouTube OAuth2 Configuration (Required)
YOUTUBE_CLIENT_ID=your_oauth2_client_id_here
YOUTUBE_CLIENT_SECRET=your_oauth2_client_secret_here
YOUTUBE_REFRESH_TOKEN=your_oauth2_refresh_token_here

# Channel Configuration (Required)
CHANNEL_ID=your_channel_id_here

# AI Configuration (Optional - for AI responses)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud TTS Configuration (Required for voice feature)
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_CLOUD_KEY_FILE=path/to/your/service-account-key.json

# Optional: Environment
NODE_ENV=development
```

### 4. OAuth2 Setup

Run the OAuth2 setup to get your YouTube credentials:

```bash
npm run setup-oauth2
```

Follow the prompts to authenticate with YouTube and get your credentials.

### 5. Google Cloud Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Text-to-Speech API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Text-to-Speech API" and enable it

3. **Create Service Account**:
   - Go to "IAM & Admin" > "Service Accounts"
   - Create a new service account
   - Download the JSON key file
   - Set the path in your `.env` file

### 6. Start the Bot

```bash
# Start the bot
npm start
```

The bot will:
1. Connect to your YouTube channel
2. Monitor active livestreams
3. Process incoming chat messages
4. Generate AI responses (if enabled)
5. Convert responses to speech and play them locally
6. Send responses back to YouTube chat

## 🎛️ Configuration

### AI Personalities

The bot comes with several pre-configured AI personalities. Choose one in `src/index.ts`:

```typescript
// General purpose assistant
ai: getAIConfig()

// Gaming-focused AI (knows about games, gaming terminology)
ai: GAMING_AI_CONFIG

// Educational content AI (patient, helpful, informative)
ai: EDUCATIONAL_AI_CONFIG

// Custom AI with specific prompt
ai: getAIConfig({
  systemPrompt: "You are a helpful assistant for my cooking stream..."
})
```

### Voice Options

Choose from various voice configurations:

```typescript
// Indonesian voices
const voiceConfig = getVoiceConfig("INDONESIAN_ENERGETIC"); // Fast, high-pitched
const voiceConfig = getVoiceConfig("INDONESIAN_NORMAL");    // Standard speed
const voiceConfig = getVoiceConfig("INDONESIAN_MALE");      // Male voice
const voiceConfig = getVoiceConfig("INDONESIAN_FAST");      // Very fast
const voiceConfig = getVoiceConfig("INDONESIAN_SLOW");      // Slow and clear

// English voices
const voiceConfig = getVoiceConfig("ENGLISH_ENERGETIC");    // Fast, high-pitched
const voiceConfig = getVoiceConfig("ENGLISH_NORMAL");       // Standard speed
const voiceConfig = getVoiceConfig("ENGLISH_MALE");         // Male voice
const voiceConfig = getVoiceConfig("ENGLISH_FAST");         // Very fast
const voiceConfig = getVoiceConfig("ENGLISH_SLOW");         // Slow and clear
```

### Custom Voice Configuration

Create your own voice configuration:

```typescript
const customVoice = {
  language: Language.INDONESIAN,
  voice: Voice.INDONESIAN_FEMALE,
  gender: Gender.FEMALE,
  speakingRate: 1.2,      // Speed (0.25 - 4.0)
  pitch: 1.0,             // Pitch (-20.0 - 20.0)
  volumeGainDb: 2.0       // Volume (-96.0 - 16.0)
};
```

## 📁 Project Structure

```
src/
├── config/
│   ├── aiConfig.ts          # AI configuration and system prompts
│   ├── audioConfig.ts       # Audio processing configuration
│   └── voiceConfig.ts       # Voice and TTS configuration
├── services/
│   ├── AIService.ts         # AI chat processing service
│   ├── AIVoiceService.ts    # Combined AI + TTS service
│   ├── TTSService.ts        # Text-to-speech service
│   └── AudioStreamService.ts # Audio file management
├── types/
│   ├── AITypes.ts           # AI-related type definitions
│   ├── BotConfig.ts         # Bot configuration types
│   └── YouTubeTypes.ts      # YouTube API types
├── utils/
│   ├── Logger.ts            # Logging utility
│   ├── OAuth2Auth.ts        # OAuth2 authentication
│   └── OAuth2Setup.ts       # OAuth2 setup utility
├── LivestreamMonitor.ts     # Livestream and chat monitoring
├── YouTubeBot.ts            # Main bot class
└── index.ts                 # Application entry point
```

## 🛠️ Development

### Available Scripts

```bash
# Build TypeScript
npm run build

# Start the bot
npm start

# Development mode
npm run dev

# Watch for changes
npm run watch

# Setup OAuth2 credentials
npm run setup-oauth2

# Test audio functionality
npm run audio-test

# Compare different voices
npm run voice-comparison
```

### Adding Custom AI Prompts

Edit `src/config/aiConfig.ts` to add new AI personalities:

```typescript
export const CUSTOM_PROMPT = `You are a specialized AI assistant for [your content type].
[Your specific instructions here]`;

export const CUSTOM_AI_CONFIG = getAIConfig({
  systemPrompt: CUSTOM_PROMPT,
  temperature: 0.8,
  maxTokens: 150
});
```

### Adding Custom Voices

Edit `src/config/voiceConfig.ts` to add new voice configurations:

```typescript
export const CUSTOM_VOICE_CONFIG = {
  language: Language.ENGLISH,
  voice: Voice.ENGLISH_FEMALE_2,
  gender: Gender.FEMALE,
  speakingRate: 1.1,
  pitch: 1.5,
  volumeGainDb: 1.0
};
```

## 🔧 Troubleshooting

### Voice Issues

**Problem**: No audio output
- ✅ Check Google Cloud credentials are correct
- ✅ Verify Text-to-Speech API is enabled
- ✅ Ensure service account has proper permissions
- ✅ Check audio output directory exists and is writable
- ✅ Verify audio device is working

**Problem**: Audio quality issues
- ✅ Adjust `speakingRate`, `pitch`, and `volumeGainDb` in voice config
- ✅ Try different voice options
- ✅ Check audio format settings

### AI Issues

**Problem**: AI not responding
- ✅ Verify Gemini API key is set in `.env`
- ✅ Check AI configuration in `src/index.ts`
- ✅ Review logs for error messages
- ✅ Ensure internet connection is stable

**Problem**: Poor AI responses
- ✅ Adjust `temperature` and `maxTokens` in AI config
- ✅ Modify system prompt for better context
- ✅ Try different AI personalities

### YouTube API Issues

**Problem**: Authentication errors
- ✅ Verify OAuth2 credentials are correct
- ✅ Check channel ID is correct
- ✅ Ensure YouTube Data API v3 is enabled
- ✅ Re-run OAuth2 setup if needed

**Problem**: Bot not connecting to livestream
- ✅ Verify you have an active livestream
- ✅ Check channel ID matches your channel
- ✅ Ensure bot has proper permissions

## 📋 Requirements

### System Requirements
- **Node.js**: 18.0.0 or higher
- **RAM**: Minimum 512MB, recommended 1GB+
- **Storage**: 100MB for application + audio cache
- **Network**: Stable internet connection

### API Requirements
- **YouTube Data API v3**: Enabled in Google Cloud Console
- **Google Cloud Text-to-Speech API**: Enabled in Google Cloud Console
- **Gemini API**: For AI responses (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) for voice synthesis
- [Google Gemini AI](https://ai.google.dev/) for intelligent responses
- [YouTube Data API](https://developers.google.com/youtube/v3) for livestream integration
- [TypeScript](https://www.typescriptlang.org/) for type safety

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the logs for error messages
3. Open an issue on GitHub with detailed information
4. Include your configuration (without sensitive data) and error logs

---

**Happy Streaming! 🎮🎤** 