import { Request } from 'express';
import OperationLog from '../models/OperationLog.model';
import { LogModule, LogOperation } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface LogOptions {
  module: LogModule;
  operation: LogOperation;
  targetId?: string;
  targetType?: string;
  description?: string;
  includeRequestData?: boolean;
  includeResponseData?: boolean;
}

interface LogResult {
  logId: string;
  startTime: number;
}

class OperationLogger {
  private static instance: OperationLogger;
  private activeLogs: Map<string, { startTime: number; options: LogOptions }> = new Map();

  static getInstance(): OperationLogger {
    if (!OperationLogger.instance) {
      OperationLogger.instance = new OperationLogger();
    }
    return OperationLogger.instance;
  }

  startLog(req: Request, options: LogOptions): LogResult {
    const logId = uuidv4();
    const startTime = Date.now();
    this.activeLogs.set(logId, { startTime, options });
    (req as any).logId = logId;
    return { logId, startTime };
  }

  async completeLog(
    req: Request,
    statusCode: number,
    responseData?: any,
    errorMessage?: string
  ): Promise<void> {
    const logId = (req as any).logId;
    const logEntry = this.activeLogs.get(logId);
    
    if (!logEntry) return;

    const { startTime, options } = logEntry;
    const executionTime = Date.now() - startTime;

    try {
      const user = (req as any).user;
      const requestParams = options.includeRequestData !== false 
        ? JSON.stringify(req.params || {}) 
        : undefined;
      const requestBody = options.includeRequestData !== false 
        ? this.sanitizeBody(req.body) 
        : undefined;
      const responseDataStr = options.includeResponseData !== false && responseData
        ? JSON.stringify(responseData)
        : undefined;

      await OperationLog.create({
        id: logId,
        module: options.module,
        operation: options.operation,
        userId: user?.userId || 'system',
        username: user?.username,
        userRole: user?.role,
        targetId: options.targetId,
        targetType: options.targetType,
        ipAddress: this.getIpAddress(req),
        userAgent: req.get('user-agent'),
        requestUrl: req.originalUrl,
        requestMethod: req.method,
        requestParams,
        requestBody,
        responseData: responseDataStr,
        statusCode,
        errorMessage,
        executionTime,
        description: options.description
      });
    } catch (error) {
      console.error('Failed to save operation log:', error);
    } finally {
      this.activeLogs.delete(logId);
    }
  }

  async createLog(
    req: Request,
    options: LogOptions & {
      statusCode?: number;
      errorMessage?: string;
      executionTime?: number;
    }
  ): Promise<string> {
    const logId = uuidv4();
    const user = (req as any).user;

    try {
      await OperationLog.create({
        id: logId,
        module: options.module,
        operation: options.operation,
        userId: user?.userId || 'system',
        username: user?.username,
        userRole: user?.role,
        targetId: options.targetId,
        targetType: options.targetType,
        ipAddress: this.getIpAddress(req),
        userAgent: req.get('user-agent'),
        requestUrl: req.originalUrl,
        requestMethod: req.method,
        requestParams: options.includeRequestData !== false 
          ? JSON.stringify(req.params || {}) 
          : undefined,
        requestBody: options.includeRequestData !== false 
          ? this.sanitizeBody(req.body) 
          : undefined,
        statusCode: options.statusCode || 200,
        errorMessage: options.errorMessage,
        executionTime: options.executionTime || 0,
        description: options.description
      });
    } catch (error) {
      console.error('Failed to create operation log:', error);
    }

    return logId;
  }

  private sanitizeBody(body: any): string | undefined {
    if (!body) return undefined;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'creditCard', 'cardNumber'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });

    return JSON.stringify(sanitized);
  }

  private getIpAddress(req: Request): string {
    return (
      req.ip ||
      req.connection?.remoteAddress ||
      (req as any).socket?.remoteAddress ||
      (req as any).connection?.socket?.remoteAddress ||
      'unknown'
    );
  }
}

export const operationLogger = OperationLogger.getInstance();

export const logOperation = (options: LogOptions) => {
  return (req: Request, res: any, next: any) => {
    const { logId, startTime } = operationLogger.startLog(req, options);

    const originalSend = res.send;
    res.send = function(body: any) {
      res.send = originalSend;
      const result = originalSend.call(this, body);
      
      let parsedBody;
      try {
        parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
      } catch {
        parsedBody = body;
      }

      operationLogger.completeLog(req, res.statusCode, parsedBody);
      return result;
    };

    next();
  };
};
