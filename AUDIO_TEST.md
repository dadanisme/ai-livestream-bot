# 🎤 Audio Test

Test the Text-to-Speech voice generation without running the full bot.

## 🚀 Quick Start

```bash
# Test a single voice configuration
npm run audio-test

# Test multiple voice configurations for comparison
npm run voice-comparison
```

## 📋 Prerequisites

1. **Google Cloud Setup** (same as main bot):
   - Google Cloud project with Text-to-Speech API enabled
   - Service account with JSON key file
   - Environment variables configured in `.env`

2. **Environment Variables** (in `.env`):
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLOUD_KEY_FILE=path/to/service-account-key.json
   ```

## 🎵 What Each Test Does

### Single Voice Test (`npm run audio-test`)
1. **Initialize TTS Service** with selected voice configuration
2. **Generate 5 test audio files** with messages in the selected language
3. **Play each audio file** automatically using `afplay` (macOS)
4. **Save files** to `./audio_output/` folder

### Voice Comparison Test (`npm run voice-comparison`)
1. **Test 16 different voice configurations** automatically
2. **Generate comparison audio files** for each voice
3. **Play each voice** in sequence for easy comparison
4. **Save all files** with descriptive names

## 🎙️ Available Voice Configurations

### Indonesian Voices (8 variations)
- **`INDONESIAN_ENERGETIC`** - Fast, high-pitched female (default)
- **`INDONESIAN_NORMAL`** - Normal speed female
- **`INDONESIAN_FAST`** - Very fast female (1.5x speed)
- **`INDONESIAN_SLOW`** - Slow, calm female (0.8x speed)
- **`INDONESIAN_HIGH_PITCH`** - Very high-pitched female
- **`INDONESIAN_LOW_PITCH`** - Low-pitched male
- **`INDONESIAN_LOUD`** - Loud female (3dB boost)
- **`INDONESIAN_SOFT`** - Soft female (-1dB reduction)
- **`INDONESIAN_MALE`** - Standard male voice
- **`INDONESIAN_MALE_2`** - Alternative male voice
- **`INDONESIAN_FEMALE_2`** - Alternative female voice

### English Voices (12 variations)
- **`ENGLISH_ENERGETIC`** - Fast, high-pitched female
- **`ENGLISH_NORMAL`** - Normal speed female
- **`ENGLISH_FAST`** - Very fast female (1.5x speed)
- **`ENGLISH_SLOW`** - Slow, calm female (0.8x speed)
- **`ENGLISH_HIGH_PITCH`** - Very high-pitched female
- **`ENGLISH_LOW_PITCH`** - Low-pitched male
- **`ENGLISH_LOUD`** - Loud female (3dB boost)
- **`ENGLISH_SOFT`** - Soft female (-1dB reduction)
- **`ENGLISH_MALE`** - Standard male voice
- **`ENGLISH_MALE_2`** - Alternative male voice
- **`ENGLISH_MALE_3`** - Third male voice option
- **`ENGLISH_MALE_4`** - Fourth male voice option
- **`ENGLISH_FEMALE_2`** - Alternative female voice
- **`ENGLISH_FEMALE_3`** - Third female voice option
- **`ENGLISH_FEMALE_4`** - Fourth female voice option

## ⚙️ Voice Settings Examples

### Indonesian Energetic (Default)
- **Language**: Indonesian (`id-ID`)
- **Voice**: Female Indonesian (`id-ID-Standard-A`)
- **Speed**: 1.3x (30% faster than normal)
- **Pitch**: 2.0 (higher, more energetic)
- **Volume**: +2dB (louder)

### Indonesian Fast
- **Speed**: 1.5x (50% faster)
- **Pitch**: 1.0 (slightly higher)
- **Volume**: +1.5dB

### Indonesian Slow
- **Speed**: 0.8x (20% slower)
- **Pitch**: -0.5 (slightly lower)
- **Volume**: +0.5dB

### English Loud
- **Speed**: 1.2x (20% faster)
- **Pitch**: 1.0 (slightly higher)
- **Volume**: +3dB (very loud)

## 🔧 Customization

### Change Voice in Audio Test
Edit `src/audio-test.ts` and change this line:
```typescript
const voiceConfig = getVoiceConfig("INDONESIAN_ENERGETIC");
```

### Change Voice in Main Bot
Edit `src/index.ts` and change this line:
```typescript
const voiceConfig = getVoiceConfig("INDONESIAN_ENERGETIC");
```

### Customize Voice Comparison Test
Edit `src/voice-comparison-test.ts` and modify the `testConfigs` array:
```typescript
const testConfigs = [
  "INDONESIAN_ENERGETIC",
  "INDONESIAN_FAST",
  "ENGLISH_ENERGETIC",
  // Add or remove voice configurations
];
```

## 📁 Output

### Single Voice Test
Audio files will be saved as:
- `test_1.mp3`
- `test_2.mp3`
- `test_3.mp3`
- `test_4.mp3`
- `test_5.mp3`

### Voice Comparison Test
Audio files will be saved as:
- `indonesian_energetic_test.mp3`
- `indonesian_normal_test.mp3`
- `indonesian_fast_test.mp3`
- `indonesian_slow_test.mp3`
- `indonesian_high_pitch_test.mp3`
- `indonesian_low_pitch_test.mp3`
- `indonesian_loud_test.mp3`
- `indonesian_soft_test.mp3`
- `english_energetic_test.mp3`
- `english_normal_test.mp3`
- `english_fast_test.mp3`
- `english_slow_test.mp3`
- `english_high_pitch_test.mp3`
- `english_low_pitch_test.mp3`
- `english_loud_test.mp3`
- `english_soft_test.mp3`

## 🎯 Recommended Workflow

1. **Start with voice comparison**: `npm run voice-comparison`
2. **Listen to all variations** and note your favorites
3. **Test individual voices**: Edit `src/audio-test.ts` and run `npm run audio-test`
4. **Choose your favorite** and update `src/index.ts`

## 🐛 Troubleshooting

- **"GOOGLE_CLOUD_PROJECT_ID not set"**: Check your `.env` file
- **"GOOGLE_CLOUD_KEY_FILE not set"**: Verify the path to your service account key
- **Audio not playing**: Check if `afplay` is available (macOS only)
- **TTS errors**: Verify Google Cloud Text-to-Speech API is enabled
- **Voice not found**: Check that the voice name exists in Google Cloud TTS
- **Too many requests**: The voice comparison test makes many API calls, consider testing fewer voices at once 