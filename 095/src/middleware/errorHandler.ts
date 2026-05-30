import { Request, Response, NextFunction } from 'express';
import { errorResponse, serverErrorResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '../utils/response';
import logger from '../config/logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 400, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
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
  error: Error | AppError, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`[${req.method}] ${req.path} - ${error.message}`, {
    error: error.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user,
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      errorResponse(error.message, error.statusCode, error.details)
    );
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json(
      validationErrorResponse([error], error.message)
    );
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(
      unauthorizedResponse('无效的令牌')
    );
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json(
      unauthorizedResponse('令牌已过期')
    );
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json(
      unauthorizedResponse('未授权访问')
    );
  }

  if (error.name === 'ForbiddenError') {
    return res.status(403).json(
      forbiddenResponse('权限不足')
    );
  }

  if (error.name === 'NotFoundError') {
    return res.status(404).json(
      notFoundResponse('资源不存在')
    );
  }

  if (error.name === 'SequelizeValidationError') {
    const errors = (error as any).errors.map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json(
      validationErrorResponse(errors, '数据验证失败')
    );
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const errors = (error as any).errors.map((e: any) => ({
      field: e.path,
      message: `${e.path} 已存在`,
    }));
    return res.status(409).json(
      validationErrorResponse(errors, '数据唯一性约束失败')
    );
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json(
      errorResponse('关联数据不存在或关联关系错误', 400)
    );
  }

  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(500).json(
    serverErrorResponse(
      isProduction ? '服务器内部错误' : error.message,
      isProduction ? undefined : error.stack
    )
  );
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn(`404 Not Found: [${req.method}] ${req.path}`);
  res.status(404).json(notFoundResponse('请求的资源不存在'));
};
