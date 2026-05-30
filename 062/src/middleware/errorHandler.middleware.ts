import { Request, Response, NextFunction } from 'express';
import {
  HttpException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException
} from '../exceptions/HttpException';
import { ResponseUtil } from '../utils/response';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (error instanceof HttpException) {
    return ResponseUtil.error(res, error.message, error.status);
  }

  if (error.name === 'ValidationError') {
    return ResponseUtil.badRequest(res, error.message);
  }

  if (error.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, 'Token无效');
  }

  if (error.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, 'Token已过期，请重新登录');
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return ResponseUtil.conflict(res, '数据已存在，请勿重复提交');
  }

  if (error.name === 'SequelizeValidationError') {
    const errors = (error as any).errors.map((e: any) => ({
      field: e.path,
      message: e.message
    }));
    return ResponseUtil.badRequest(res, errors);
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return ResponseUtil.badRequest(res, '关联数据不存在，请检查参数');
  }

  return ResponseUtil.error(res, '服务器内部错误', 500);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  ResponseUtil.notFound(res, `请求的路径 ${req.path} 不存在`);
};
