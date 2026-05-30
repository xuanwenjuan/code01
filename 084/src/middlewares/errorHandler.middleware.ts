import { Request, Response, NextFunction } from 'express';
import {
  AppException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException
} from '../exceptions/AppException';
import { ValidationError } from 'express-validator';

export interface ErrorResponse {
  success: boolean;
  code: number;
  message: string;
  errors?: ValidationError[];
  timestamp: number;
  path?: string;
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: ValidationError[] | undefined;

  if (err instanceof AppException) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.array && typeof err.array === 'function') {
    const validationErrors = err.array();
    if (validationErrors.length > 0) {
      statusCode = 400;
      message = 'Validation Error';
      errors = validationErrors;
    }
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的Token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token已过期';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = '数据验证失败';
    errors = err.errors.map((e: any) => ({
      value: e.value,
      msg: e.message,
      param: e.path,
      location: 'body'
    }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = '数据已存在';
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = '关联数据不存在';
  }

  const response: ErrorResponse = {
    success: false,
    code: statusCode,
    message,
    timestamp: Date.now(),
    path: req.path
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  throw new NotFoundException(`路由 ${req.path} 不存在`);
};
