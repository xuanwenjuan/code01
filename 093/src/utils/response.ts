import { ApiResponse, PaginatedResponse } from '../types';

export class ResponseUtil {
  static success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
    return {
      success: true,
      code: 200,
      message,
      data,
      timestamp: Date.now(),
    };
  }

  static created<T>(data?: T, message: string = '创建成功'): ApiResponse<T> {
    return {
      success: true,
      code: 201,
      message,
      data,
      timestamp: Date.now(),
    };
  }

  static paginated<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
  ): ApiResponse<PaginatedResponse<T>> {
    return {
      success: true,
      code: 200,
      message,
      data: {
        list,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      timestamp: Date.now(),
    };
  }

  static error(message: string = '操作失败', code: number = 500): ApiResponse {
    return {
      success: false,
      code,
      message,
      timestamp: Date.now(),
    };
  }

  static badRequest(message: string = '请求参数错误'): ApiResponse {
    return this.error(message, 400);
  }

  static unauthorized(message: string = '未授权访问'): ApiResponse {
    return this.error(message, 401);
  }

  static forbidden(message: string = '权限不足'): ApiResponse {
    return this.error(message, 403);
  }

  static notFound(message: string = '资源不存在'): ApiResponse {
    return this.error(message, 404);
  }
}
