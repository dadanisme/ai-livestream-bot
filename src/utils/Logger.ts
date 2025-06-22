export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] [${this.context}] ${message}${dataStr}`;
  }

  info(message: string, data?: unknown): void {
    console.log(this.formatMessage('INFO', message, data));
  }

  warn(message: string, data?: unknown): void {
    console.warn(this.formatMessage('WARN', message, data));
  }

  error(message: string, error?: unknown): void {
    console.error(this.formatMessage('ERROR', message, error));
  }

  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }
} 