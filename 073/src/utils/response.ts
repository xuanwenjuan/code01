import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export class ResponseUtil {
  private static getTimestamp(): number {
    return Date.now();
  }

  static success<T>(res: Response, data?: T, message: string = '操作成功'): Response<ApiResponse<T>> {
    return res.status(200).json({
      code: 200,
      message,
      data,
      success: true,
      timestamp: this.getTimestamp()
    });
  }

  static paginated<T>(
    res: Response,
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
  ): Response<ApiResponse<PaginatedResponse<T>>> {
    return res.status(200).json({
      code: 200,
      message,
      data: { list, total, page, pageSize },
      success: true,
      timestamp: this.getTimestamp()
    });
  }

  static error(res: Response, message: string = '操作失败', code: number = 400, errors?: any): Response<ApiResponse> {
    return res.status(code).json({
      code,
      message,
      errors,
      success: false,
      timestamp: this.getTimestamp()
    });
  }

  static unauthorized(res: Response, message: string = '未授权访问'): Response<ApiResponse> {
    return res.status(401).json({
      code: 401,
      message,
      success: false,
      timestamp: this.getTimestamp()
    });
  }

  static forbidden(res: Response, message: string = '权限不足'): Response<ApiResponse> {
    return res.status(403).json({
      code: 403,
      message,
      success: false,
      timestamp: this.getTimestamp()
    });
  }

  static notFound(res: Response, message: string = '资源不存在'): Response<ApiResponse> {
    return res.status(404).json({
      code: 404,
      message,
      success: false,
      timestamp: this.getTimestamp()
    });
  }

  static serverError(res: Response, message: string = '服务器内部错误'): Response<ApiResponse> {
    return res.status(500).json({
      code: 500,
      message,
      success: false,
      timestamp: this.getTimestamp()
    });
  }
}
