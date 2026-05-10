import { Request, Response, NextFunction } from 'express';
import { ApiResponse, AppError as AppErrorType, AsyncMiddleware } from '../types';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFoundHandler = (req: Request, res: Response<ApiResponse<null>>) => {
  res.status(404).json({
    success: false,
    message: `路由未找到: ${req.originalUrl}`
  });
};

export const globalErrorHandler = (
  err: Error & Partial<AppErrorType>,
  req: Request,
  res: Response<ApiResponse<null>>,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  console.error('[Error]', err);

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : '服务器内部错误'
  });
};

export const asyncHandler: AsyncMiddleware = (fn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
