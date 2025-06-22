import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/Logger';

export interface AudioStreamConfig {
  outputDir: string;
  audioFormat: 'MP3' | 'WAV' | 'OGG';
}

export class AudioStreamService {
  private logger: Logger;
  private config: AudioStreamConfig;

  constructor(config: AudioStreamConfig) {
    this.config = config;
    this.logger = new Logger("AudioStreamService");
  }

  /**
   * Save audio buffer to file
   */
  async saveAudioBuffer(audioBuffer: Buffer, filename?: string): Promise<string> {
    try {
      const audioFilename = filename || `audio_${Date.now()}.${this.config.audioFormat.toLowerCase()}`;
      const outputPath = path.join(this.config.outputDir, audioFilename);

      // Ensure output directory exists
      if (!fs.existsSync(this.config.outputDir)) {
        fs.mkdirSync(this.config.outputDir, { recursive: true });
      }

      // Write the audio content to a file
      fs.writeFileSync(outputPath, audioBuffer);

      this.logger.info(`Audio saved to: ${outputPath}`);
      return outputPath;
    } catch (error) {
      this.logger.error('Error saving audio buffer:', error);
      throw error;
    }
  }

  /**
   * Get audio file info
   */
  getAudioFileInfo(filePath: string): { size: number; exists: boolean } {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        exists: true
      };
    } catch (error) {
      return {
        size: 0,
        exists: false
      };
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AudioStreamConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AudioStreamConfig {
    return { ...this.config };
  }
} 