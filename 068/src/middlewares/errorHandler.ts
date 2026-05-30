import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'joi';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize';
import logger from '../utils/logger';
import { ResponseUtil } from '../utils/response';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = '请求参数错误') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409);
  }
}

export class ValidationAppError extends AppError {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super(`参数验证失败：${errors.join('; ')}`, 400);
    this.errors = errors;
  }
}

const handleJoiValidationError = (error: ValidationError): AppError => {
  const errors = error.details.map((detail) => detail.message);
  return new ValidationAppError(errors);
};

const handleSequelizeValidationError = (error: SequelizeValidationError): AppError => {
  const errors = error.errors.map((err) => err.message);
  return new ValidationAppError(errors);
};

const handleSequelizeUniqueConstraintError = (error: UniqueConstraintError): AppError => {
  const fields = error.errors.map((err) => err.path).join(', ');
  return new ConflictError(`字段重复：${fields}`);
};

const handleJwtError = (error: JsonWebTokenError): AppError => {
  if (error instanceof TokenExpiredError) {
    return new UnauthorizedError('Token 已过期');
  }
  return new UnauthorizedError('Token 无效');
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`[${req.method}] ${req.path} - ${err.message}`, {
    stack: err.stack,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user,
  });

  if (err instanceof AppError) {
    return ResponseUtil.error(res, err.message, err.statusCode);
  }

  if (err instanceof ValidationError) {
    const appError = handleJoiValidationError(err);
    return ResponseUtil.error(res, appError.message, appError.statusCode);
  }

  if (err instanceof SequelizeValidationError) {
    const appError = handleSequelizeValidationError(err);
    return ResponseUtil.error(res, appError.message, appError.statusCode);
  }

  if (err instanceof UniqueConstraintError) {
    const appError = handleSequelizeUniqueConstraintError(err);
    return ResponseUtil.error(res, appError.message, appError.statusCode);
  }

  if (err instanceof JsonWebTokenError) {
    const appError = handleJwtError(err);
    return ResponseUtil.error(res, appError.message, appError.statusCode);
  }

  return ResponseUtil.error(res, '服务器内部错误', 500);
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn(`404 - [${req.method}] ${req.path}`);
  return ResponseUtil.notFound(res, '请求的资源不存在');
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
