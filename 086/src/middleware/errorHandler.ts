import { Request, Response, NextFunction } from 'express';
import { ResponseUtil, HttpStatusCode } from '../utils/response';
import {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  ValidationException,
  InternalServerErrorException
} from '../exceptions/HttpException';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[${new Date().toISOString()}] Error:`, error);

  if (error instanceof HttpException) {
    const statusCode = error.statusCode || HttpStatusCode.BAD_REQUEST;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '请求处理失败',
      data: null,
      timestamp: Date.now()
    });
  }

  if (error.name === 'ValidationError' || error.isJoi) {
    const details = error.details?.map((d: any) => d.message).join(', ');
    return ResponseUtil.validationError(res, '参数验证失败', details);
  }

  if (error.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, 'Token无效或已过期');
  }

  if (error.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, 'Token已过期，请重新登录');
  }

  if (error.name === 'SequelizeValidationError') {
    const details = error.errors?.map((e: any) => `${e.path}: ${e.message}`).join(', ');
    return ResponseUtil.validationError(res, '数据验证失败', details);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return ResponseUtil.conflict(res, '数据已存在，请勿重复提交');
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return ResponseUtil.badRequest(res, '关联数据不存在或不匹配');
  }

  if (error.code === 'ENOENT') {
    return ResponseUtil.notFound(res, '文件或资源不存在');
  }

  return ResponseUtil.serverError(res, '服务器内部错误，请稍后重试', error);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  ResponseUtil.notFound(res, `接口 ${req.method} ${req.path} 不存在`);
};
