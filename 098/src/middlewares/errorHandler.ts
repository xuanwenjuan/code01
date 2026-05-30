import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { ResponseUtil } from '../utils/response';
import { createOperationLog } from '../services/operationLogService';

export const errorHandler = (
  error: HttpException | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status = error instanceof HttpException ? error.status : 500;
    const message = error.message || '服务器内部错误';

    if (req.user) {
      const duration = Date.now() - (req as any).startTime || 0;
      createOperationLog(
        req,
        'system',
        'error',
        message,
        'error',
        duration,
        message
      );
    }

    console.error(`[${new Date().toISOString()}] ${status} - ${message}`);
    console.error(error.stack);

    ResponseUtil.error(res, message, status);
  } catch (logError) {
    console.error('错误日志记录失败:', logError);
    ResponseUtil.error(res, '服务器内部错误', 500);
  }
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  ResponseUtil.error(res, `接口 ${req.method} ${req.path} 不存在`, 404);
};

export const requestStartTime = (req: Request, res: Response, next: NextFunction) => {
  (req as any).startTime = Date.now();
  next();
};
