import { ApiResponse, ErrorCode, ValidationError } from '../types';

export class ResponseUtil {
  static success<T>(data?: T, message: string = 'success'): ApiResponse<T> {
    return {
      code: ErrorCode.SUCCESS,
      message,
      data,
      timestamp: Date.now(),
    };
  }

  static error(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    errors?: ValidationError[]
  ): ApiResponse<{ errors?: ValidationError[] }> {
    return {
      code,
      message,
      data: errors ? { errors } : undefined,
      timestamp: Date.now(),
    };
  }

  static validationError(errors: ValidationError[]): ApiResponse<{ errors: ValidationError[] }> {
    return {
      code: ErrorCode.VALIDATION_ERROR,
      message: '参数验证失败',
      data: { errors },
      timestamp: Date.now(),
    };
  }

  static unauthorized(message: string = '未授权访问'): ApiResponse {
    return {
      code: ErrorCode.UNAUTHORIZED,
      message,
      timestamp: Date.now(),
    };
  }

  static forbidden(message: string = '权限不足'): ApiResponse {
    return {
      code: ErrorCode.FORBIDDEN,
      message,
      timestamp: Date.now(),
    };
  }

  static notFound(message: string = '资源不存在'): ApiResponse {
    return {
      code: ErrorCode.NOT_FOUND,
      message,
      timestamp: Date.now(),
    };
  }

  static badRequest(message: string = '请求参数错误'): ApiResponse {
    return {
      code: ErrorCode.BAD_REQUEST,
      message,
      timestamp: Date.now(),
    };
  }

  static paginated<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number
  ): ApiResponse<{ list: T[]; total: number; page: number; pageSize: number }> {
    return {
      code: ErrorCode.SUCCESS,
      message: 'success',
      data: {
        list,
        total,
        page,
        pageSize,
      },
      timestamp: Date.now(),
    };
  }
}
