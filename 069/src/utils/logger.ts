import dayjs from 'dayjs';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;

  static setLevel(level: LogLevel): void {
    Logger.level = level;
  }

  private static format(level: string, message: string, data?: any): string {
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  static debug(message: string, data?: any): void {
    if (Logger.level <= LogLevel.DEBUG) {
      console.debug(this.format('DEBUG', message, data));
    }
  }

  static info(message: string, data?: any): void {
    if (Logger.level <= LogLevel.INFO) {
      console.info(this.format('INFO', message, data));
    }
  }

  static warn(message: string, data?: any): void {
    if (Logger.level <= LogLevel.WARN) {
      console.warn(this.format('WARN', message, data));
    }
  }

  static error(message: string, data?: any): void {
    if (Logger.level <= LogLevel.ERROR) {
      console.error(this.format('ERROR', message, data));
    }
  }
}
