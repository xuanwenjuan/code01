import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

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

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`${req.method} ${req.path} - ${error.message}`, {
    stack: error.stack,
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      code: error.statusCode,
      message: error.message,
      timestamp: Date.now()
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      message: error.message,
      timestamp: Date.now()
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: '无效的token',
      timestamp: Date.now()
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: 'token已过期',
      timestamp: Date.now()
    });
  }

  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    timestamp: Date.now()
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    message: `找不到 ${req.method} ${req.path} 接口`,
    timestamp: Date.now()
  });
};
