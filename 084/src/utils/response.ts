import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  errors?: any[];
  timestamp: number;
}

export class ResponseUtil {
  static success<T>(res: Response, data?: T, message: string = 'success'): Response<ApiResponse<T>> {
    return res.status(200).json({
      success: true,
      code: 200,
      message,
      data,
      timestamp: Date.now()
    });
  }

  static created<T>(res: Response, data?: T, message: string = 'created successfully'): Response<ApiResponse<T>> {
    return res.status(201).json({
      success: true,
      code: 201,
      message,
      data,
      timestamp: Date.now()
    });
  }

  static error(res: Response, code: number = 500, message: string = 'Internal Server Error', errors?: any[]): Response<ApiResponse> {
    return res.status(code).json({
      success: false,
      code,
      message,
      errors,
      timestamp: Date.now()
    });
  }

  static badRequest(res: Response, message: string = 'Bad Request', errors?: any[]): Response<ApiResponse> {
    return this.error(res, 400, message, errors);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response<ApiResponse> {
    return this.error(res, 401, message);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response<ApiResponse> {
    return this.error(res, 403, message);
  }

  static notFound(res: Response, message: string = 'Not Found'): Response<ApiResponse> {
    return this.error(res, 404, message);
  }

  static validationError(res: Response, errors: any[]): Response<ApiResponse> {
    return res.status(400).json({
      success: false,
      code: 400,
      message: 'Validation Error',
      errors,
      timestamp: Date.now()
    });
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}

export default ResponseUtil;