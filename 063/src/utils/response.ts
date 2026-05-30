import { Response } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export class ResponseUtil {
  static success<T>(res: Response, data?: T, message: string = '操作成功'): Response<ApiResponse<T>> {
    return res.status(200).json({
      code: 200,
      message,
      data,
      timestamp: Date.now()
    });
  }

  static error(res: Response, message: string = '操作失败', code: number = 500): Response<ApiResponse> {
    return res.status(code).json({
      code,
      message,
      timestamp: Date.now()
    });
  }

  static badRequest(res: Response, message: string = '请求参数错误'): Response<ApiResponse> {
    return this.error(res, message, 400);
  }

  static unauthorized(res: Response, message: string = '未授权，请先登录'): Response<ApiResponse> {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = '权限不足'): Response<ApiResponse> {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = '资源不存在'): Response<ApiResponse> {
    return this.error(res, message, 404);
  }
}