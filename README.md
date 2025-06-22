# AI Livestream Bot with Voice

A YouTube livestream bot built with TypeScript that can monitor live chat, respond with AI-generated messages, and speak responses using text-to-speech.

## Features

- 🤖 **AI Chat Responses**: Uses Google's Gemini AI to generate contextual responses to live chat messages
- 🎤 **Text-to-Speech**: Converts AI responses to speech using Google Cloud TTS
- 🔊 **Local Audio Playback**: Plays generated audio locally (perfect for mixing with OBS)
- 💬 **Batch Processing**: Processes multiple chat messages together for more contextual responses
- 📊 **Rate Limiting**: Prevents spam by limiting message frequency

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Required environment variables:

```env
# YouTube OAuth2 Configuration
YOUTUBE_CLIENT_ID=your_oauth2_client_id_here
YOUTUBE_CLIENT_SECRET=your_oauth2_client_secret_here
YOUTUBE_REFRESH_TOKEN=your_oauth2_refresh_token_here

# Channel Configuration
CHANNEL_ID=your_channel_id_here

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud TTS Configuration (Required for voice feature)
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_CLOUD_KEY_FILE=path/to/your/service-account-key.json
```

### 3. OAuth2 Setup

Run the OAuth2 setup to get your credentials:

```bash
npm run setup-oauth2
```

### 4. Google Cloud Setup

1. Create a Google Cloud project
2. Enable the Text-to-Speech API
3. Create a service account and download the JSON key file
4. Set the `GOOGLE_CLOUD_KEY_FILE` path in your `.env`

## Usage

### Start the Bot

```bash
npm start
```

The bot will:
1. Monitor your YouTube livestreams
2. Process chat messages in batches
3. Generate AI responses
4. Convert responses to speech and play them locally
5. Send responses to YouTube chat

### Voice Configuration

The voice feature is enabled by default in `src/index.ts`. You can customize:

- **Voice**: Indonesian female voice (`id-ID-Standard-A`)
- **Language**: Indonesian (`id-ID`)
- **Audio Format**: MP3
- **Output Directory**: `./audio_output`

### AI Configuration

Choose from different AI configurations in `src/index.ts`:

- **General Purpose**: `getAIConfig()`
- **Gaming**: `GAMING_AI_CONFIG`
- **Educational**: `EDUCATIONAL_AI_CONFIG`
- **Custom**: `getAIConfig({ custom: "settings" })`

## File Structure

```
src/
├── config/
│   ├── aiConfig.ts          # AI configuration and prompts
│   └── audioConfig.ts       # Audio configuration
├── services/
│   ├── AIService.ts         # AI chat processing
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

## Customization

### Changing Voice

Edit the voice configuration in `src/index.ts`:

```typescript
voice: {
  languageCode: "en-US",  // Change language
  name: "en-US-Standard-A", // Change voice
  ssmlGender: "MALE"      // Change gender
}
```

### Changing AI Behavior

Modify the system prompt in `src/config/aiConfig.ts` or use different configurations:

```typescript
// Gaming-focused AI
ai: GAMING_AI_CONFIG

// Educational content AI
ai: EDUCATIONAL_AI_CONFIG

// Custom AI with specific prompt
ai: getAIConfig({
  systemPrompt: "You are a helpful assistant for my cooking stream..."
})
```

## Troubleshooting

### Voice Not Working

1. Check Google Cloud credentials are correct
2. Verify Text-to-Speech API is enabled
3. Ensure service account has proper permissions
4. Check audio output directory exists

### AI Not Responding

1. Verify Gemini API key is set
2. Check AI configuration in `src/index.ts`
3. Review logs for error messages

### YouTube API Issues

1. Verify OAuth2 credentials
2. Check channel ID is correct
3. Ensure YouTube Data API v3 is enabled

## Development

```bash
# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Watch for changes
npm run watch
```

## License

ISC 