import { Response } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export class ResponseUtil {
  static success<T>(res: Response, data?: T, message: string = 'success'): Response {
    return res.status(200).json({
      code: 200,
      message,
      data,
      timestamp: Date.now()
    });
  }

  static error(res: Response, code: number = 500, message: string = 'Internal Server Error'): Response {
    return res.status(code).json({
      code,
      message,
      timestamp: Date.now()
    });
  }

  static badRequest(res: Response, message: string = 'Bad Request'): Response {
    return this.error(res, 400, message);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, 401, message);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, 403, message);
  }

  static notFound(res: Response, message: string = 'Not Found'): Response {
    return this.error(res, 404, message);
  }
}
