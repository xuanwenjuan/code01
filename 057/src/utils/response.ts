import { Response } from 'express';

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export enum ErrorCode {
  SUCCESS = 0,
  UNKNOWN_ERROR = 10000,
  INVALID_PARAMS = 10001,
  UNAUTHORIZED = 10002,
  FORBIDDEN = 10003,
  RESOURCE_NOT_FOUND = 10004,
  RESOURCE_CONFLICT = 10005,
  TOKEN_EXPIRED = 10006,
  TOKEN_INVALID = 10007,
  DATABASE_ERROR = 10008,
}

export interface ApiResponse<T = any> {
  code: number;
  errorCode: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedData<T> {
  list: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export class ResponseUtil {
  static success<T>(
    res: Response,
    data?: T,
    message: string = '操作成功'
  ): Response<ApiResponse<T>> {
    return res.status(HttpStatusCode.OK).json({
      code: HttpStatusCode.OK,
      errorCode: ErrorCode.SUCCESS,
      message,
      data,
      success: true,
      timestamp: new Date().toISOString(),
    });
  }

  static created<T>(
    res: Response,
    data?: T,
    message: string = '创建成功'
  ): Response<ApiResponse<T>> {
    return res.status(HttpStatusCode.CREATED).json({
      code: HttpStatusCode.CREATED,
      errorCode: ErrorCode.SUCCESS,
      message,
      data,
      success: true,
      timestamp: new Date().toISOString(),
    });
  }

  static paginated<T>(
    res: Response,
    data: PaginatedData<T>,
    message: string = '获取列表成功'
  ): Response<ApiResponse<PaginatedData<T>>> {
    return res.status(HttpStatusCode.OK).json({
      code: HttpStatusCode.OK,
      errorCode: ErrorCode.SUCCESS,
      message,
      data,
      success: true,
      timestamp: new Date().toISOString(),
    });
  }

  static noContent(res: Response, message: string = '操作成功'): Response<ApiResponse> {
    return res.status(HttpStatusCode.NO_CONTENT).json({
      code: HttpStatusCode.NO_CONTENT,
      errorCode: ErrorCode.SUCCESS,
      message,
      success: true,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res: Response,
    httpCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
    errorCode: number = ErrorCode.UNKNOWN_ERROR,
    message: string = '服务器内部错误'
  ): Response<ApiResponse> {
    return res.status(httpCode).json({
      code: httpCode,
      errorCode,
      message,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }

  static badRequest(
    res: Response,
    message: string = '请求参数错误',
    errorCode: number = ErrorCode.INVALID_PARAMS
  ): Response<ApiResponse> {
    return this.error(res, HttpStatusCode.BAD_REQUEST, errorCode, message);
  }

  static unauthorized(
    res: Response,
    message: string = '未授权访问',
    errorCode: number = ErrorCode.UNAUTHORIZED
  ): Response<ApiResponse> {
    return this.error(res, HttpStatusCode.UNAUTHORIZED, errorCode, message);
  }

  static forbidden(
    res: Response,
    message: string = '权限不足',
    errorCode: number = ErrorCode.FORBIDDEN
  ): Response<ApiResponse> {
    return this.error(res, HttpStatusCode.FORBIDDEN, errorCode, message);
  }

  static notFound(
    res: Response,
    message: string = '资源不存在',
    errorCode: number = ErrorCode.RESOURCE_NOT_FOUND
  ): Response<ApiResponse> {
    return this.error(res, HttpStatusCode.NOT_FOUND, errorCode, message);
  }

  static conflict(
    res: Response,
    message: string = '资源冲突',
    errorCode: number = ErrorCode.RESOURCE_CONFLICT
  ): Response<ApiResponse> {
    return this.error(res, HttpStatusCode.CONFLICT, errorCode, message);
  }

  static validationError(
    res: Response,
    errors: string | string[],
    message: string = '参数验证失败'
  ): Response<ApiResponse> {
    const errorMessage = Array.isArray(errors) ? errors.join('; ') : errors;
    return this.badRequest(res, `${message}: ${errorMessage}`);
  }
}

