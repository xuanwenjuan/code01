export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: number;
}

export class ResponseUtil {
  static success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
      success: true,
      timestamp: Date.now()
    };
  }

  static error(message: string = '操作失败', code: number = 500): ApiResponse {
    return {
      code,
      message,
      success: false,
      timestamp: Date.now()
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
