import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'joi';
import { ValidationError as ValidationErrorType, ApiResponse } from '../types';
import logger from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: ValidationErrorType[];

  constructor(message: string, statusCode: number = 500, errors?: ValidationErrorType[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (error: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = '服务器内部错误';
  let errors: ValidationErrorType[] | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  } else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    message = '请求体格式错误';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = '未授权访问';
  } else {
    logger.error('未处理的错误:', error);
  }

  const response: ApiResponse = {
    success: false,
    code: statusCode,
    message,
    timestamp: Date.now()
  };

  if (errors && errors.length > 0) {
    (response as any).errors = errors;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  throw new AppError(`未找到 ${req.method} ${req.originalUrl} 路由`, 404);
};

export const handleValidationError = (error: ValidationError): AppError => {
  const errors: ValidationErrorType[] = error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message.replace(/"/g, '')
  }));

  return new AppError('参数验证失败', 400, errors);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createSuccessResponse = <T>(data: T, message: string = '操作成功'): ApiResponse<T> => {
  return {
    success: true,
    code: 200,
    message,
    data,
    timestamp: Date.now()
  };
};

export const createErrorResponse = (message: string, code: number = 400): ApiResponse => {
  return {
    success: false,
    code,
    message,
    timestamp: Date.now()
  };
};
