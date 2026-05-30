import { Response } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
}

export class ResponseUtil {
  static success<T>(res: Response, data?: T, message = '操作成功'): Response<ApiResponse<T>> {
    return res.status(200).json({
      code: 200,
      message,
      data,
      success: true,
    });
  }

  static error(res: Response, message = '操作失败', code = 500): Response<ApiResponse> {
    return res.status(code).json({
      code,
      message,
      success: false,
    });
  }

  static badRequest(res: Response, message = '请求参数错误'): Response<ApiResponse> {
    return this.error(res, message, 400);
  }

  static unauthorized(res: Response, message = '未授权访问'): Response<ApiResponse> {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = '权限不足'): Response<ApiResponse> {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message = '资源不存在'): Response<ApiResponse> {
    return this.error(res, message, 404);
  }
}
