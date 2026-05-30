import { ApiResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class BusinessException extends Error {
  public code: number;
  public requestId?: string;

  constructor(message: string, code: number = 400) {
    super(message);
    this.code = code;
    this.requestId = uuidv4();
  }
}

export function success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
  return {
    code: 200,
    message,
    data,
    timestamp: Date.now(),
    requestId: uuidv4()
  };
}

export function error(message: string = '操作失败', code: number = 500, data?: any): ApiResponse {
  return {
    code,
    message,
    data,
    timestamp: Date.now(),
    requestId: uuidv4()
  };
}

export function badRequest(message: string = '请求参数错误', data?: any): ApiResponse {
  return {
    code: 400,
    message,
    data,
    timestamp: Date.now(),
    requestId: uuidv4()
  };
}

export function unauthorized(message: string = '未授权，请先登录'): ApiResponse {
  return {
    code: 401,
    message,
    timestamp: Date.now(),
    requestId: uuidv4()
  };
}

export function forbidden(message: string = '权限不足，无法访问'): ApiResponse {
  return {
    code: 403,
    message,
    timestamp: Date.now(),
    requestId: uuidv4()
  };
}

export function notFound(message: string = '资源不存在'): ApiResponse {
  return {
    code: 404,
    message,
    timestamp: Date.now(),
    requestId: uuidv4()
  };
}

export function paginationResult<T>(list: T[], total: number, page: number, pageSize: number) {
  return {
    list,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}
