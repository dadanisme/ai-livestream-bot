import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/Logger';

export interface TTSConfig {
  apiKey: string;
  voice: string;
  language: string;
  audioFormat: 'MP3' | 'WAV' | 'OGG';
  outputDir: string;
  speakingRate: number;
  pitch: number;
  volumeGainDb: number;
}

export class TTSService {
  private client: TextToSpeechClient;
  private logger: Logger;
  private config: TTSConfig;

  constructor(config: TTSConfig) {
    this.config = config;
    this.logger = new Logger("TTSService");
    
    // Initialize Google Cloud TTS client
    this.client = new TextToSpeechClient({
      keyFilename: config.apiKey, // Path to your service account key file
    });
  }

  /**
   * Convert text to speech and save as audio file
   */
  async textToSpeech(text: string, filename?: string): Promise<string> {
    try {
      this.logger.debug(`Converting text to speech: "${text}"`);

      // Configure the request
      const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
        input: { text },
        voice: {
          languageCode: this.config.language,
          name: this.config.voice,
        },
        audioConfig: {
          audioEncoding: this.getAudioEncoding(),
          speakingRate: this.config.speakingRate,
          pitch: this.config.pitch,
          volumeGainDb: this.config.volumeGainDb,
        },
      };

      // Perform the text-to-speech request
      const [response] = await this.client.synthesizeSpeech(request);
      const audioContent = response.audioContent;

      if (!audioContent) {
        throw new Error('No audio content received from TTS service');
      }

      // Generate filename if not provided
      const audioFilename = filename || `tts_${Date.now()}.${this.config.audioFormat.toLowerCase()}`;
      const outputPath = path.join(this.config.outputDir, audioFilename);

      // Ensure output directory exists
      if (!fs.existsSync(this.config.outputDir)) {
        fs.mkdirSync(this.config.outputDir, { recursive: true });
      }

      // Write the audio content to a file
      fs.writeFileSync(outputPath, audioContent, 'binary');

      this.logger.info(`Audio saved to: ${outputPath}`);
      return outputPath;
    } catch (error) {
      this.logger.error('Error converting text to speech:', error);
      throw error;
    }
  }

  /**
   * Get the correct audio encoding for the format
   */
  private getAudioEncoding(): protos.google.cloud.texttospeech.v1.AudioEncoding {
    switch (this.config.audioFormat) {
      case 'MP3':
        return protos.google.cloud.texttospeech.v1.AudioEncoding.MP3;
      case 'WAV':
        return protos.google.cloud.texttospeech.v1.AudioEncoding.LINEAR16;
      case 'OGG':
        return protos.google.cloud.texttospeech.v1.AudioEncoding.OGG_OPUS;
      default:
        return protos.google.cloud.texttospeech.v1.AudioEncoding.MP3;
    }
  }

  /**
   * Get available voices for a language
   */
  async getAvailableVoices(languageCode?: string): Promise<any[]> {
    try {
      const [response] = await this.client.listVoices({
        languageCode: languageCode || this.config.language,
      });

      return response.voices || [];
    } catch (error) {
      this.logger.error('Error getting available voices:', error);
      throw error;
    }
  }

  /**
   * Update TTS configuration
   */
  updateConfig(newConfig: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): TTSConfig {
    return { ...this.config };
  }
} 