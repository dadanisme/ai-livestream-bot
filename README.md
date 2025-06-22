# YouTube Livestream Bot

A TypeScript-based bot that monitors YouTube channels for livestream events and provides real-time notifications.

## Features

- 🎥 Monitor YouTube channels for livestream events
- 📊 Track livestream status changes (upcoming → live → ended)
- 🔔 Webhook notifications for livestream events
- 💬 Live chat monitoring
- 🛡️ Error handling and retry mechanisms
- 📝 Comprehensive logging

## Prerequisites

- Node.js 16+ 
- YouTube OAuth2 credentials
- Channel ID to monitor

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-livestream-bot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
YOUTUBE_CLIENT_ID=your_oauth2_client_id_here
YOUTUBE_CLIENT_SECRET=your_oauth2_client_secret_here
YOUTUBE_REFRESH_TOKEN=your_oauth2_refresh_token_here
CHANNEL_ID=your_channel_id_here
WEBHOOK_URL=https://your-webhook-url.com/endpoint  # Optional
NODE_ENV=development
```

## Getting YouTube OAuth2 Credentials

### 1. Create OAuth2 Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Go to 'Credentials' → 'Create Credentials' → 'OAuth 2.0 Client IDs'
5. Choose 'Desktop application' as application type
6. Download the client configuration
7. Add `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` to your `.env` file

### 2. Get Refresh Token

Run the OAuth2 setup script:
```bash
npm run setup-oauth2
```

This will:
1. Open a browser window for authentication
2. Guide you through the OAuth2 flow
3. Generate a refresh token
4. Add it to your `.env` file

**Required OAuth2 scopes:**
- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/youtube.force-ssl`

## Getting Channel ID

1. Go to the YouTube channel you want to monitor
2. Right-click and "View Page Source"
3. Search for `"channelId":"` 
4. Copy the channel ID (starts with UC)

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Watch Mode (auto-rebuild on changes)
```bash
npm run watch
```

## Configuration

The bot can be configured through environment variables:

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `YOUTUBE_CLIENT_ID` | Yes | OAuth2 client ID | - |
| `YOUTUBE_CLIENT_SECRET` | Yes | OAuth2 client secret | - |
| `YOUTUBE_REFRESH_TOKEN` | Yes | OAuth2 refresh token | - |
| `CHANNEL_ID` | Yes | YouTube channel ID to monitor | - |
| `WEBHOOK_URL` | No | Webhook URL for notifications | - |
| `NODE_ENV` | No | Environment (development/production) | development |

## Webhook Events

When `WEBHOOK_URL` is configured, the bot sends POST requests with the following events:

### Livestream Start
```json
{
  "event": "livestream_start",
  "livestream": {
    "id": "video_id",
    "title": "Stream Title",
    "status": "live",
    "url": "https://www.youtube.com/watch?v=video_id"
  }
}
```

### Livestream Status Change
```json
{
  "event": "livestream_status_change",
  "livestream": {
    "id": "video_id",
    "title": "Stream Title",
    "status": "live",
    "viewerCount": 1234
  }
}
```

### Livestream End
```json
{
  "event": "livestream_end",
  "livestream": {
    "id": "video_id",
    "title": "Stream Title",
    "status": "ended"
  }
}
```

## Project Structure

```
src/
├── index.ts              # Main entry point
├── YouTubeBot.ts         # Main bot class
├── LivestreamMonitor.ts  # Livestream monitoring logic
├── types/
│   ├── BotConfig.ts      # Configuration types
│   └── YouTubeTypes.ts   # YouTube API types
└── utils/
    └── Logger.ts         # Logging utility
```

## API Rate Limits

The YouTube Data API has quotas:
- 10,000 units per day (free tier)
- Each search request: 100 units
- Each video request: 1 unit

The bot is configured to check every 30 seconds by default, which is well within the free tier limits.

## Error Handling

The bot includes robust error handling:
- Automatic retries on API failures
- Graceful shutdown on errors
- Comprehensive logging
- Webhook failure handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License 