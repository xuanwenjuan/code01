import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseUtil {
  static success<T>(res: Response, data?: T, message: string = '操作成功', code: number = 200): Response {
    const response: ApiResponse<T> = {
      code,
      message,
      data,
      success: true
    };
    return res.status(code).json(response);
  }

  static error(res: Response, message: string = '操作失败', code: number = 400): Response {
    const response: ApiResponse = {
      code,
      message,
      success: false
    };
    return res.status(code).json(response);
  }

  static unauthorized(res: Response, message: string = '未授权访问'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = '权限不足'): Response {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = '资源不存在'): Response {
    return this.error(res, message, 404);
  }

  static serverError(res: Response, message: string = '服务器内部错误'): Response {
    return this.error(res, message, 500);
  }
}