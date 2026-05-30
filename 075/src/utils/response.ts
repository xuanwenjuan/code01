
import { Response } from 'express';
import { ApiResponse, ApiErrorResponse, ValidationError } from '../types';
import { v4 as uuidv4 } from 'uuid';

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: ValidationError[];

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errors?: ValidationError[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = '请求参数错误', errors?: ValidationError[]) {
    super(message, HttpStatus.BAD_REQUEST, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '权限不足') {
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
    super(message, HttpStatus.CONFLICT);
  }
}

export const successResponse = <T>(
  res: Response,
  data?: T,
  message: string = '操作成功',
  statusCode: number = HttpStatus.OK
): Response => {
  const response: ApiResponse<T> = {
    code: statusCode,
    message,
    data,
    timestamp: Date.now(),
    requestId: res.locals.requestId || uuidv4()
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  error: AppError | Error,
  path?: string
): Response => {
  let statusCode: number;
  let message: string;
  let errors: ValidationError[] | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  } else {
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    message = '服务器内部错误';
    console.error('Unexpected error:', error);
  }

  const response: ApiErrorResponse = {
    code: statusCode,
    message,
    errors,
    timestamp: Date.now(),
    path
  };

  return res.status(statusCode).json(response);
};

export const paginatedResponse = <T>(
  res: Response,
  list: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = '查询成功'
): Response => {
  return successResponse(
    res,
    {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    },
    message
  );
};
