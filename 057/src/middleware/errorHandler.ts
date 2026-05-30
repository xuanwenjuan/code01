import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { ErrorCode } from '../utils/response';
import logger from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`[${req.method}] ${req.path} - ${error.message}`);
  
  if (error instanceof HttpException) {
    let errorCode = ErrorCode.UNKNOWN_ERROR;
    
    switch (error.statusCode) {
      case 400:
        errorCode = ErrorCode.INVALID_PARAMS;
        break;
      case 401:
        errorCode = ErrorCode.UNAUTHORIZED;
        break;
      case 403:
        errorCode = ErrorCode.FORBIDDEN;
        break;
      case 404:
        errorCode = ErrorCode.RESOURCE_NOT_FOUND;
        break;
      case 409:
        errorCode = ErrorCode.RESOURCE_CONFLICT;
        break;
    }
    
    return res.status(error.statusCode).json({
      code: error.statusCode,
      errorCode,
      message: error.message,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(500).json({
    code: 500,
    errorCode: ErrorCode.UNKNOWN_ERROR,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : error.message,
    success: false,
    timestamp: new Date().toISOString(),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({
    code: 404,
    errorCode: ErrorCode.RESOURCE_NOT_FOUND,
    message: `路由 ${req.method} ${req.path} 不存在`,
    success: false,
    timestamp: new Date().toISOString(),
  });
};
