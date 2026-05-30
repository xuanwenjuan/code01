import { Request, Response, NextFunction } from 'express';
import { errorResponse, AppError } from '../utils/response';
import { OperationLogService } from '../services/operationLog.service';
import { LogModule, LogAction } from '../types';

export const errorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.error('Error:', err);

  let statusCode = 500;
  let message = '服务器内部错误';

  if (err instanceof AppError) {
    statusCode = err.code;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message || '请求参数验证失败';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的令牌';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '令牌已过期';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors?.[0]?.message || '数据验证失败';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = err.errors?.[0]?.message || '数据已存在';
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = '关联数据不存在';
  }

  try {
    await OperationLogService.logError(
      req,
      LogModule.AUTH,
      LogAction.UPDATE,
      `请求失败: ${req.originalUrl}`,
      message
    );
  } catch (logError) {
    console.error('记录错误日志失败:', logError);
  }

  errorResponse(res, message, statusCode);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  errorResponse(res, `请求的资源不存在: ${req.method} ${req.originalUrl}`, 404);
};
