import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import logger from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = '服务器内部错误';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = '数据验证错误';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = '数据已存在';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'token已过期';
  }

  logger.error(`[${req.method}] ${req.url} - ${message}`, {
    error: err.stack,
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      ...ResponseUtil.error(message, statusCode),
      stack: err.stack
    });
  } else {
    res.status(statusCode).json(ResponseUtil.error(message, statusCode));
  }
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(ResponseUtil.notFound('接口不存在'));
};
