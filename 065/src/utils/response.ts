import { ApiResponse } from '../types';

export class ResponseUtil {
  static success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
      timestamp: Date.now(),
    };
  }

  static created<T>(data?: T, message: string = '创建成功'): ApiResponse<T> {
    return {
      code: 201,
      message,
      data,
      timestamp: Date.now(),
    };
  }

  static error(message: string = '操作失败', code: number = 400): ApiResponse {
    return {
      code,
      message,
      timestamp: Date.now(),
    };
  }

  static unauthorized(message: string = '未授权访问'): ApiResponse {
    return {
      code: 401,
      message,
      timestamp: Date.now(),
    };
  }

  static forbidden(message: string = '权限不足'): ApiResponse {
    return {
      code: 403,
      message,
      timestamp: Date.now(),
    };
  }

  static notFound(message: string = '资源不存在'): ApiResponse {
    return {
      code: 404,
      message,
      timestamp: Date.now(),
    };
  }

  static internalError(message: string = '服务器内部错误'): ApiResponse {
    return {
      code: 500,
      message,
      timestamp: Date.now(),
    };
  }
}