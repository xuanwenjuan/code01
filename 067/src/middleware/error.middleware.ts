import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import { ErrorCode, ValidationError } from '../types';
import logger from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

export class AppError extends Error {
  public readonly statusCode: ErrorCode;
  public readonly isOperational: boolean;
  public readonly errors?: ValidationError[];

  constructor(
    message: string,
    statusCode: ErrorCode = ErrorCode.INTERNAL_ERROR,
    errors?: ValidationError[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationException extends AppError {
  constructor(errors: ValidationError[]) {
    super('参数验证失败', ErrorCode.VALIDATION_ERROR, errors);
  }
}

export class NotFoundException extends AppError {
  constructor(message: string = '资源不存在') {
    super(message, ErrorCode.NOT_FOUND);
  }
}

export class BadRequestException extends AppError {
  constructor(message: string = '请求参数错误') {
    super(message, ErrorCode.BAD_REQUEST);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, ErrorCode.UNAUTHORIZED);
  }
}

export class ForbiddenException extends AppError {
  constructor(message: string = '权限不足') {
    super(message, ErrorCode.FORBIDDEN);
  }
}

export class ConflictException extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, ErrorCode.CONFLICT);
  }
}

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const traceId = uuidv4();

  logger.error(`[${traceId}] 请求错误: ${req.method} ${req.path}`, {
    error: error.message,
    stack: error.stack,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user?.id,
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      ...ResponseUtil.error(error.message, error.statusCode, error.errors),
      traceId,
    });
  }

  return res.status(ErrorCode.INTERNAL_ERROR).json({
    ...ResponseUtil.error(
      process.env.NODE_ENV === 'production'
        ? '服务器内部错误'
        : error.message || '服务器内部错误',
      ErrorCode.INTERNAL_ERROR
    ),
    traceId,
  });
};

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res
    .status(ErrorCode.NOT_FOUND)
    .json(ResponseUtil.notFound(`找不到 ${req.method} ${req.path} 接口`));
};
