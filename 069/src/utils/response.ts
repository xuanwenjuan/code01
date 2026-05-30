import { Response } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: number;
  requestId?: string;
}

export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export type ResponseCode = 
  | 200
  | 201
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 500;

export class ResponseUtil {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static formatResponse<T>(
    code: ResponseCode,
    message: string,
    success: boolean,
    data?: T
  ): ApiResponse<T> {
    return {
      code,
      message,
      data,
      success,
      timestamp: Date.now(),
      requestId: this.generateRequestId()
    };
  }

  static success<T>(res: Response, data?: T, message: string = '操作成功'): Response<ApiResponse<T>> {
    return res.status(200).json(this.formatResponse(200, message, true, data));
  }

  static created<T>(res: Response, data?: T, message: string = '创建成功'): Response<ApiResponse<T>> {
    return res.status(201).json(this.formatResponse(201, message, true, data));
  }

  static paginated<T>(
    res: Response,
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
  ): Response<ApiResponse<PageResponse<T>>> {
    return res.status(200).json(
      this.formatResponse(200, message, true, {
        list,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      })
    );
  }

  static error(res: Response, message: string = '操作失败', code: number = 400): Response<ApiResponse> {
    return res.status(code).json(this.formatResponse(code as ResponseCode, message, false));
  }

  static validationError(res: Response, message: string = '参数验证失败'): Response<ApiResponse> {
    return res.status(422).json(this.formatResponse(422, message, false));
  }

  static unauthorized(res: Response, message: string = '未授权访问，请先登录'): Response<ApiResponse> {
    return res.status(401).json(this.formatResponse(401, message, false));
  }

  static forbidden(res: Response, message: string = '权限不足，无法访问该资源'): Response<ApiResponse> {
    return res.status(403).json(this.formatResponse(403, message, false));
  }

  static notFound(res: Response, message: string = '请求的资源不存在'): Response<ApiResponse> {
    return res.status(404).json(this.formatResponse(404, message, false));
  }

  static conflict(res: Response, message: string = '资源冲突，请检查重复数据'): Response<ApiResponse> {
    return res.status(409).json(this.formatResponse(409, message, false));
  }

  static serverError(res: Response, message: string = '服务器内部错误，请稍后重试'): Response<ApiResponse> {
    return res.status(500).json(this.formatResponse(500, message, false));
  }
}
