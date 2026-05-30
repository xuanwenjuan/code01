import { Response } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: number;
}

export class ResponseUtil {
  static success<T>(res: Response, data?: T, message: string = '操作成功'): Response<ApiResponse<T>> {
    return res.status(200).json({
      code: 200,
      message,
      data,
      success: true,
      timestamp: Date.now(),
    });
  }

  static created<T>(res: Response, data?: T, message: string = '创建成功'): Response<ApiResponse<T>> {
    return res.status(201).json({
      code: 201,
      message,
      data,
      success: true,
      timestamp: Date.now(),
    });
  }

  static error(res: Response, code: number = 500, message: string = '服务器内部错误'): Response<ApiResponse> {
    return res.status(code).json({
      code,
      message,
      success: false,
      timestamp: Date.now(),
    });
  }

  static badRequest(res: Response, message: string = '请求参数错误'): Response<ApiResponse> {
    return this.error(res, 400, message);
  }

  static unauthorized(res: Response, message: string = '未授权，请先登录'): Response<ApiResponse> {
    return this.error(res, 401, message);
  }

  static forbidden(res: Response, message: string = '无权限访问'): Response<ApiResponse> {
    return this.error(res, 403, message);
  }

  static notFound(res: Response, message: string = '资源不存在'): Response<ApiResponse> {
    return this.error(res, 404, message);
  }
}
