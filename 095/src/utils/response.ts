import { ApiResponse, PaginatedResponse } from '../types';
import crypto from 'crypto';

const generateRequestId = (): string => {
  return crypto.randomUUID();
};

export const successResponse = <T>(data?: T, message: string = 'success'): ApiResponse<T> => {
  return {
    code: 200,
    message,
    data,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
};

export const createdResponse = <T>(data?: T, message: string = 'created successfully'): ApiResponse<T> => {
  return {
    code: 201,
    message,
    data,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
};

export const paginatedResponse = <T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = 'success'
): ApiResponse<PaginatedResponse<T>> => {
  const totalPages = Math.ceil(total / pageSize);
  return {
    code: 200,
    message,
    data: {
      list,
      total,
      page,
      pageSize,
      totalPages,
    },
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
};

export const errorResponse = (
  message: string,
  code: number = 400,
  details?: any
): ApiResponse<any> => {
  return {
    code,
    message,
    data: details || null,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
};

export const validationErrorResponse = (
  errors: any[],
  message: string = '参数验证失败'
): ApiResponse<{ errors: any[] }> => {
  return {
    code: 400,
    message,
    data: { errors },
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
};

export const unauthorizedResponse = (
  message: string = '未授权访问'
): ApiResponse<null> => {
  return {
    code: 401,
    message,
    data: null,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
};

export const forbiddenResponse = (
  message: string = '权限不足'
): ApiResponse<null> => {
  return {
    code: 403,
    message,
    data: null,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
};

export const notFoundResponse = (
  message: string = '资源不存在'
): ApiResponse<null> => {
  return {
    code: 404,
    message,
    data: null,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
};

export const serverErrorResponse = (
  message: string = '服务器内部错误',
  details?: any
): ApiResponse<null> => {
  return {
    code: 500,
    message,
    data: details,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
};

export const conflictResponse = (
  message: string = '资源冲突'
): ApiResponse<null> => {
  return {
    code: 409,
    message,
    data: null,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
};
