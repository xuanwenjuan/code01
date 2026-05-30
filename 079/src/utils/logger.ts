import dayjs from 'dayjs'
import { config } from '../config'

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

const levelMap: Record<string, LogLevel> = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR
}

const currentLevel = levelMap[config.logLevel] || LogLevel.INFO

export class Logger {
  private static format(level: string, message: string, meta?: any): string {
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`
  }

  static debug(message: string, meta?: any): void {
    if (currentLevel <= LogLevel.DEBUG) {
      console.debug(this.format('debug', message, meta))
    }
  }

  static info(message: string, meta?: any): void {
    if (currentLevel <= LogLevel.INFO) {
      console.info(this.format('info', message, meta))
    }
  }

  static warn(message: string, meta?: any): void {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(this.format('warn', message, meta))
    }
  }

  static error(message: string, meta?: any): void {
    if (currentLevel <= LogLevel.ERROR) {
      console.error(this.format('error', message, meta))
    }
  }
}
