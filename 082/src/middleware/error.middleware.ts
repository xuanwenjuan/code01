import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import { OperationLog } from '../models';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = async (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = '服务器内部错误';
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的认证令牌';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '认证令牌已过期';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = '数据验证失败';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = '数据冲突，记录已存在';
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = '外键约束错误';
  } else if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    message = '数据库操作错误';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = '文件上传错误';
  } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    statusCode = 400;
    message = 'JSON格式错误';
  }
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${new Date().toISOString()}] 错误详情:`, err.message, err.stack);
  }
  try {
    const tables = await sequelize.query(`SHOW TABLES LIKE 'operation_logs'`, { type: QueryTypes.SELECT });
    if (tables.length > 0) {
      await OperationLog.create({
        userId: req.user?.userId,
        username: req.user?.username,
        module: req.path.split('/')[1] || 'system',
        operation: req.path.split('/')[2] || 'unknown',
        method: req.method,
        params: JSON.stringify({ body: req.body, query: req.query, params: req.params }),
        ip: req.ip || req.socket.remoteAddress,
        status: false,
        errorMsg: err.message,
        duration: 0
      });
    }
  } catch (logError) {
    console.error('记录错误日志失败:', logError);
  }
  res.status(statusCode).json(ResponseUtil.error(message, statusCode));
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`找不到 ${req.originalUrl} 路由`, 404, 'NOT_FOUND'));
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
