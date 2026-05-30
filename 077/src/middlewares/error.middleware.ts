import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/http.exception';
import { ApiResponse } from '../utils/response';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof HttpException) {
    return res.status(error.status).json({
      success: false,
      code: error.code,
      message: error.message,
      errors: error.errors,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: '无效的认证令牌',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      code: 'TOKEN_EXPIRED',
      message: '认证令牌已过期',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  return res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: '服务器内部错误',
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: '接口不存在',
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

export default errorHandler;
