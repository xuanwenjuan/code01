import { Response } from 'express';
import { ApiResponse, HttpStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ResponseUtil {
  private static createResponse<T>(
    code: number,
    message: string,
    data?: T
  ): ApiResponse<T> {
    return {
      code,
      message,
      data,
      timestamp: Date.now(),
      requestId: uuidv4()
    };
  }

  static success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
    return this.createResponse(HttpStatus.OK, message, data);
  }

  static created<T>(data?: T, message: string = '创建成功'): ApiResponse<T> {
    return this.createResponse(HttpStatus.CREATED, message, data);
  }

  static badRequest<T>(data?: T, message: string = '请求参数错误'): ApiResponse<T> {
    return this.createResponse(HttpStatus.BAD_REQUEST, message, data);
  }

  static unauthorized<T>(data?: T, message: string = '未授权访问'): ApiResponse<T> {
    return this.createResponse(HttpStatus.UNAUTHORIZED, message, data);
  }

  static forbidden<T>(data?: T, message: string = '无权限访问'): ApiResponse<T> {
    return this.createResponse(HttpStatus.FORBIDDEN, message, data);
  }

  static notFound<T>(data?: T, message: string = '资源不存在'): ApiResponse<T> {
    return this.createResponse(HttpStatus.NOT_FOUND, message, data);
  }

  static error<T>(data?: T, message: string = '服务器内部错误'): ApiResponse<T> {
    return this.createResponse(HttpStatus.INTERNAL_SERVER_ERROR, message, data);
  }

  static pageResult<T>(list: T[], total: number, page: number, pageSize: number, message: string = '查询成功'): ApiResponse<{ list: T[]; total: number; page: number; pageSize: number }> {
    return this.success(
      {
        list,
        total,
        page,
        pageSize
      },
      message
    );
  }

  static sendSuccess<T>(res: Response, data?: T, message: string = '操作成功'): Response {
    return res.status(HttpStatus.OK).json(this.success(data, message));
  }

  static sendCreated<T>(res: Response, data?: T, message: string = '创建成功'): Response {
    return res.status(HttpStatus.CREATED).json(this.created(data, message));
  }

  static sendBadRequest<T>(res: Response, data?: T, message: string = '请求参数错误'): Response {
    return res.status(HttpStatus.BAD_REQUEST).json(this.badRequest(data, message));
  }

  static sendUnauthorized<T>(res: Response, data?: T, message: string = '未授权访问'): Response {
    return res.status(HttpStatus.UNAUTHORIZED).json(this.unauthorized(data, message));
  }

  static sendForbidden<T>(res: Response, data?: T, message: string = '无权限访问'): Response {
    return res.status(HttpStatus.FORBIDDEN).json(this.forbidden(data, message));
  }

  static sendNotFound<T>(res: Response, data?: T, message: string = '资源不存在'): Response {
    return res.status(HttpStatus.NOT_FOUND).json(this.notFound(data, message));
  }

  static sendError<T>(res: Response, data?: T, message: string = '服务器内部错误'): Response {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(this.error(data, message));
  }

  static sendPageResult<T>(
    res: Response,
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
  ): Response {
    return res.status(HttpStatus.OK).json(this.pageResult(list, total, page, pageSize, message));
  }
}
