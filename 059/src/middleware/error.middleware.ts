import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { ValidationError } from 'express-validator';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: ValidationError[];

  constructor(message: string, statusCode: number = 500, errors?: ValidationError[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationRequestError extends AppError {
  constructor(errors: ValidationError[]) {
    const messages = errors.map(e => e.msg).join(', ');
    super(messages, 400, errors);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = '认证失败') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`[${req.method}] ${req.path} - ${error.message}`, {
    stack: error.stack,
    user: req.user?.username,
    ip: req.ip
  });
  
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      ...errorResponse(error.message, error.statusCode),
      errors: error.errors
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(errorResponse('无效的认证令牌', 401));
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json(errorResponse('认证令牌已过期', 401));
  }

  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json(errorResponse('数据验证失败', 400));
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json(errorResponse('数据已存在', 409));
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json(errorResponse('关联数据不存在或无效', 400));
  }

  return res.status(500).json(errorResponse('服务器内部错误', 500));
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  throw new NotFoundError(`找不到 ${req.method} ${req.path} 路由`);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
