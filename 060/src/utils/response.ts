import { Response } from 'express';
import { IResponse } from '../types/common';

export class ApiResponse {
  static success<T>(res: Response, data?: T, message: string = 'success'): Response<IResponse<T>> {
    return res.status(200).json({
      code: 200,
      message,
      data,
      timestamp: Date.now(),
    });
  }

  static created<T>(res: Response, data?: T, message: string = 'created'): Response<IResponse<T>> {
    return res.status(201).json({
      code: 201,
      message,
      data,
      timestamp: Date.now(),
    });
  }

  static error(res: Response, code: number = 500, message: string = 'internal server error'): Response<IResponse> {
    return res.status(code).json({
      code,
      message,
      timestamp: Date.now(),
    });
  }

  static badRequest(res: Response, message: string = 'bad request'): Response<IResponse> {
    return this.error(res, 400, message);
  }

  static unauthorized(res: Response, message: string = 'unauthorized'): Response<IResponse> {
    return this.error(res, 401, message);
  }

  static forbidden(res: Response, message: string = 'forbidden'): Response<IResponse> {
    return this.error(res, 403, message);
  }

  static notFound(res: Response, message: string = 'not found'): Response<IResponse> {
    return this.error(res, 404, message);
  }
}
