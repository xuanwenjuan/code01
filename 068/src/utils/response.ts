import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data?: T,
    message: string = '操作成功',
    code: number = 200
  ): Response<ApiResponse<T>> {
    return res.status(code).json({
      code,
      message,
      data,
      success: true,
      timestamp: Date.now(),
    });
  }

  static error(
    res: Response,
    message: string = '操作失败',
    code: number = 500
  ): Response<ApiResponse> {
    return res.status(code).json({
      code,
      message,
      success: false,
      timestamp: Date.now(),
    });
  }

  static paginated<T>(
    res: Response,
    data: PaginatedResponse<T>,
    message: string = '获取成功'
  ): Response<ApiResponse<PaginatedResponse<T>>> {
    return this.success(res, data, message);
  }

  static notFound(
    res: Response,
    message: string = '资源不存在'
  ): Response<ApiResponse> {
    return this.error(res, message, 404);
  }

  static unauthorized(
    res: Response,
    message: string = '未授权访问'
  ): Response<ApiResponse> {
    return this.error(res, message, 401);
  }

  static forbidden(
    res: Response,
    message: string = '权限不足'
  ): Response<ApiResponse> {
    return this.error(res, message, 403);
  }

  static badRequest(
    res: Response,
    message: string = '请求参数错误'
  ): Response<ApiResponse> {
    return this.error(res, message, 400);
  }

  static validationError(
    res: Response,
    errors: string[]
  ): Response<ApiResponse> {
    return this.error(res, `参数验证失败：${errors.join('; ')}`, 400);
  }

  static conflict(
    res: Response,
    message: string = '资源冲突'
  ): Response<ApiResponse> {
    return this.error(res, message, 409);
  }

  static tooManyRequests(
    res: Response,
    message: string = '请求过于频繁'
  ): Response<ApiResponse> {
    return this.error(res, message, 429);
  }
}
