import dayjs from 'dayjs';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;

  static setLevel(level: LogLevel) {
    this.level = level;
  }

  private static getTimestamp(): string {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
  }

  static debug(message: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`[DEBUG] [${this.getTimestamp()}] ${message}`, ...args);
    }
  }

  static info(message: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.log(`[INFO] [${this.getTimestamp()}] ${message}`, ...args);
    }
  }

  static warn(message: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] [${this.getTimestamp()}] ${message}`, ...args);
    }
  }

  static error(message: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] [${this.getTimestamp()}] ${message}`, ...args);
    }
  }
}
