import { Request } from 'express';
import OperationLog from '../models/OperationLog';
import { UserRole } from '../types';

export const createOperationLog = async (
  req: Request,
  module: string,
  operation: string,
  description: string,
  status: 'success' | 'error',
  duration: number,
  errorMessage?: string,
  responseData?: any
) => {
  try {
    const user = req.user;
    
    await OperationLog.create({
      module,
      operation,
      method: req.method,
      description,
      requestUrl: req.originalUrl,
      requestParams: JSON.stringify(req.params) || '{}',
      requestBody: JSON.stringify(req.body) || '{}',
      responseData: responseData ? JSON.stringify(responseData).substring(0, 5000) : undefined,
      operatorId: user?.userId || 0,
      operatorName: user?.username || 'system',
      operatorRole: user?.role || UserRole.ADMIN,
      ipAddress: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('User-Agent') || '',
      status,
      errorMessage: errorMessage?.substring(0, 2000),
      duration
    });
  } catch (error) {
    console.error('创建操作日志失败:', error);
  }
};

export const logOperation = (
  module: string,
  operation: string,
  description: string
) => {
  return (req: Request, res: any, next: any) => {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function(this: any, body: any) {
      const duration = Date.now() - startTime;
      const isSuccess = res.statusCode < 400;
      
      createOperationLog(
        req,
        module,
        operation,
        description,
        isSuccess ? 'success' : 'error',
        duration,
        isSuccess ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
        isSuccess ? body : undefined
      );
      
      return originalSend.call(this, body);
    };

    next();
  };
};
