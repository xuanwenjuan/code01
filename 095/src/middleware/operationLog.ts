import { Request, Response, NextFunction } from 'express';
import OperationLog from '../models/OperationLog';
import { LogModule, OperationType } from '../types';
import logger from '../config/logger';

const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string) ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    req.ip ||
    ''
  );
};

const sensitiveFields = ['password', 'token', 'authorization', 'secret'];

const sanitizeData = (data: any): any => {
  if (!data) return data;
  if (typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  }
  return sanitized;
};

export const createOperationLog = async (
  req: Request,
  res: Response,
  module: LogModule,
  operationType: OperationType,
  targetId?: number,
  description?: string
) => {
  try {
    await OperationLog.create({
      module,
      operationType,
      targetId,
      operatorId: req.user?.userId || 0,
      operatorName: req.user?.realName || req.user?.username || '系统',
      description,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      requestMethod: req.method,
      requestUrl: req.originalUrl,
      requestParams: {
        body: sanitizeData(req.body),
        query: sanitizeData(req.query),
        params: req.params,
      },
      responseStatus: res.statusCode,
    });
  } catch (error) {
    logger.error('创建操作日志失败:', error);
  }
};

export const operationLog = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;
  const originalJson = res.json;

  const logAfterResponse = () => {
    const duration = Date.now() - startTime;
    
    let module: LogModule = LogModule.SYSTEM;
    let operationType: OperationType = OperationType.UPDATE;
    
    const path = req.path;
    if (path.includes('/auth')) {
      module = LogModule.SYSTEM;
      if (req.method === 'POST') operationType = OperationType.CREATE;
    } else if (path.includes('/users')) {
      module = LogModule.USER;
      if (req.method === 'POST') operationType = OperationType.CREATE;
      else if (req.method === 'DELETE') operationType = OperationType.DELETE;
    } else if (path.includes('/categories')) {
      module = LogModule.CATEGORY;
      if (req.method === 'POST') operationType = OperationType.CREATE;
      else if (req.method === 'DELETE') operationType = OperationType.DELETE;
    } else if (path.includes('/products')) {
      module = LogModule.PRODUCT;
      if (req.method === 'POST') operationType = OperationType.CREATE;
      else if (req.method === 'DELETE') operationType = OperationType.DELETE;
    } else if (path.includes('/materials')) {
      module = LogModule.MATERIAL;
      if (req.method === 'POST') operationType = OperationType.CREATE;
      else if (req.method === 'DELETE') operationType = OperationType.DELETE;
      else if (path.includes('/stock')) operationType = OperationType.STOCK_IN;
    } else if (path.includes('/orders')) {
      module = LogModule.ORDER;
      if (req.method === 'POST') operationType = OperationType.CREATE;
      else if (req.method === 'DELETE') operationType = OperationType.DELETE;
      else if (path.includes('/status')) operationType = OperationType.STATUS_CHANGE;
    } else if (path.includes('/ledgers')) {
      module = LogModule.LEDGER;
      if (req.method === 'POST') operationType = OperationType.CREATE;
      else if (req.method === 'DELETE') operationType = OperationType.DELETE;
    }

    if (req.method !== 'GET' || module !== LogModule.SYSTEM) {
      createOperationLog(req, res, module, operationType);
      logger.debug(`[${module}] ${req.method} ${path} - ${duration}ms, status: ${res.statusCode}`);
    }
  };

  (res as any).send = function(this: Response, body: any) {
    logAfterResponse();
    return originalSend.call(this, body);
  };

  (res as any).json = function(this: Response, body: any) {
    logAfterResponse();
    return originalJson.call(this, body);
  };

  next();
};
