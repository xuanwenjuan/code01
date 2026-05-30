import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(__dirname, '../../logs');

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

export class Logger {
  private static ensureLogDir(): void {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  }

  private static writeLog(level: LogLevel, message: string, data?: any): void {
    this.ensureLogDir();

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };

    const logString = JSON.stringify(logEntry) + '\n';
    const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}.log`);

    fs.appendFileSync(logFile, logString, 'utf8');
    console.log(`[${level.toUpperCase()}] ${message}`, data || '');
  }

  static debug(message: string, data?: any): void {
    this.writeLog(LogLevel.DEBUG, message, data);
  }

  static info(message: string, data?: any): void {
    this.writeLog(LogLevel.INFO, message, data);
  }

  static warn(message: string, data?: any): void {
    this.writeLog(LogLevel.WARN, message, data);
  }

  static error(message: string, data?: any): void {
    this.writeLog(LogLevel.ERROR, message, data);
  }
}
