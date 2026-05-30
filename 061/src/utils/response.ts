import { Response } from 'express';
import { ApiResponse, PaginatedResult } from '../types';

export class ApiError extends Error {
  public code: number;
  public isOperational: boolean;

  constructor(message: string, code: number = 500) {
    super(message);
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class SuccessResponse<T = any> {
  private data: ApiResponse<T>;

  constructor(data?: T, message: string = '操作成功', code: number = 200) {
    this.data = {
      success: true,
      code,
      message,
      data,
      timestamp: Date.now(),
    };
  }

  public send(res: Response): Response {
    return res.status(this.data.code).json(this.data);
  }
}

export const success = <T>(res: Response, data?: T, message: string = '操作成功', code: number = 200) => {
  return new SuccessResponse(data, message, code).send(res);
};

export const paginatedSuccess = <T>(
  res: Response,
  list: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = '查询成功'
) => {
  const result: PaginatedResult<T> = {
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
  return success(res, result, message);
};

export const error = (res: Response, message: string = '操作失败', code: number = 500) => {
  const response: ApiResponse = {
    success: false,
    code,
    message,
    timestamp: Date.now(),
  };
  return res.status(code).json(response);
};

export const notFound = (res: Response, message: string = '资源不存在') => {
  return error(res, message, 404);
};

export const badRequest = (res: Response, message: string = '请求参数错误') => {
  return error(res, message, 400);
};

export const unauthorized = (res: Response, message: string = '未授权访问') => {
  return error(res, message, 401);
};

export const forbidden = (res: Response, message: string = '权限不足') => {
  return error(res, message, 403);
};
