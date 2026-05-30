import { Request, Response, NextFunction } from 'express';
import { AppError, NotFoundError, BusinessError, ValidationError, AuthenticationError, AuthorizationError } from '../utils/errors';
import { Logger } from '../utils/logger';
import { ResponseUtil } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorInfo = {
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    query: req.query,
    params: req.params,
    ip: req.ip
  };

  if (err instanceof AppError) {
    Logger.warn(`Business Error: ${err.message}`, errorInfo);
  } else {
    Logger.error(`Server Error: ${err.message}`, errorInfo);
  }

  if (err instanceof NotFoundError) {
    return ResponseUtil.notFound(res, err.message);
  }

  if (err instanceof BusinessError) {
    return ResponseUtil.error(res, err.message, 400);
  }

  if (err instanceof ValidationError) {
    return ResponseUtil.error(res, err.message, 400);
  }

  if (err instanceof AuthenticationError) {
    return ResponseUtil.unauthorized(res, err.message);
  }

  if (err instanceof AuthorizationError) {
    return ResponseUtil.forbidden(res, err.message);
  }

  if (err instanceof AppError) {
    return ResponseUtil.error(res, err.message, err.statusCode);
  }

  if (err.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, 'Token 无效');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, 'Token 已过期');
  }

  if (err.name === 'SequelizeValidationError') {
    const errors = (err as any).errors?.map((e: any) => e.message).join(', ');
    return ResponseUtil.error(res, `数据验证失败: ${errors}`, 400);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return ResponseUtil.error(res, '数据已存在，请检查唯一约束', 409);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return ResponseUtil.error(res, '关联数据不存在，请检查外键约束', 400);
  }

  if (err.name === 'SequelizeDatabaseError') {
    return ResponseUtil.error(res, '数据库操作失败', 500);
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return ResponseUtil.error(res, '请求体格式错误', 400);
  }

  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message;
  
  return ResponseUtil.serverError(res, message);
};

export const notFoundHandler = (req: Request, res: Response) => {
  Logger.warn(`404 Not Found: ${req.method} ${req.path}`, {
    ip: req.ip,
    query: req.query
  });
  return ResponseUtil.notFound(res, '接口不存在');
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    Logger[logLevel](`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      ip: req.ip,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent')
    });
  });

  next();
};
