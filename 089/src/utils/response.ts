import { ApiResponse } from '../types';
import { randomUUID } from 'crypto';

export class ResponseUtil {
  static success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
      success: true,
      timestamp: Date.now(),
      requestId: randomUUID()
    };
  }

  static error(message: string = '操作失败', code: number = 500, requestId?: string): ApiResponse {
    return {
      code,
      message,
      success: false,
      timestamp: Date.now(),
      requestId: requestId || randomUUID()
    };
  }

  static badRequest(message: string = '请求参数错误', requestId?: string): ApiResponse {
    return {
      code: 400,
      message,
      success: false,
      timestamp: Date.now(),
      requestId: requestId || randomUUID()
    };
  }

  static unauthorized(message: string = '未授权访问', requestId?: string): ApiResponse {
    return {
      code: 401,
      message,
      success: false,
      timestamp: Date.now(),
      requestId: requestId || randomUUID()
    };
  }

  static forbidden(message: string = '权限不足', requestId?: string): ApiResponse {
    return {
      code: 403,
      message,
      success: false,
      timestamp: Date.now(),
      requestId: requestId || randomUUID()
    };
  }

  static notFound(message: string = '资源不存在', requestId?: string): ApiResponse {
    return {
      code: 404,
      message,
      success: false,
      timestamp: Date.now(),
      requestId: requestId || randomUUID()
    };
  }
}