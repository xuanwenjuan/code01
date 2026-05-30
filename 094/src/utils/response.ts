import { Response } from 'express';
import { IApiResponse, IPaginationResult } from '../types';

export const successResponse = <T>(
  res: Response,
  data?: T,
  message: string = '操作成功',
  code: number = 200
): Response<IApiResponse<T>> => {
  return res.status(code).json({
    code,
    message,
    data,
    success: true,
    timestamp: Date.now(),
  });
};

export const errorResponse = (
  res: Response,
  message: string = '操作失败',
  code: number = 500,
  data?: any
): Response<IApiResponse> => {
  return res.status(code >= 100 && code < 600 ? code : 500).json({
    code,
    message,
    data,
    success: false,
    timestamp: Date.now(),
  });
};

export const paginationResponse = <T>(
  res: Response,
  list: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = '查询成功'
): Response<IApiResponse<IPaginationResult<T>>> => {
  return successResponse(
    res,
    {
      list,
      total,
      page,
      pageSize,
    },
    message
  );
};

export const badRequestError = (res: Response, message: string = '请求参数错误'): Response<IApiResponse> => {
  return errorResponse(res, message, 400);
};

export const unauthorizedError = (res: Response, message: string = '未授权访问'): Response<IApiResponse> => {
  return errorResponse(res, message, 401);
};

export const forbiddenError = (res: Response, message: string = '权限不足'): Response<IApiResponse> => {
  return errorResponse(res, message, 403);
};

export const notFoundError = (res: Response, message: string = '资源不存在'): Response<IApiResponse> => {
  return errorResponse(res, message, 404);
};

export const conflictError = (res: Response, message: string = '资源冲突'): Response<IApiResponse> => {
  return errorResponse(res, message, 409);
};

export const unprocessableEntityError = (res: Response, message: string = '请求无法处理'): Response<IApiResponse> => {
  return errorResponse(res, message, 422);
};

export class AppError extends Error {
  public readonly code: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: number = 500, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
