import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import { HttpStatus } from '../types';
import logger from '../utils/logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = HttpStatus.BAD_REQUEST) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = '请求参数错误') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '无权限访问') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`[${req.method}] ${req.path} - ${error.message}`, {
    stack: error.stack,
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      code: error.statusCode,
      message: error.message,
      timestamp: Date.now()
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(HttpStatus.BAD_REQUEST).json(
      ResponseUtil.badRequest(null, error.message)
    );
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(HttpStatus.UNAUTHORIZED).json(
      ResponseUtil.unauthorized(null, 'Token无效')
    );
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(HttpStatus.UNAUTHORIZED).json(
      ResponseUtil.unauthorized(null, 'Token已过期')
    );
  }

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
    ResponseUtil.error(null, process.env.NODE_ENV === 'production' ? '服务器内部错误' : error.message)
  );
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(HttpStatus.NOT_FOUND).json(
    ResponseUtil.notFound(null, `路径 ${req.method} ${req.path} 不存在`)
  );
};
