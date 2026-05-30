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

  static page<T>(list: T[], total: number, page: number, pageSize: number, message: string = '查询成功'): ApiResponse {
    return {
      code: 200,
      message,
      data: {
        list,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      },
      success: true,
      timestamp: Date.now()
    };
  }
}

export class BusinessException extends Error {
  code: number;
  
  constructor(message: string, code: number = 400) {
    super(message);
    this.code = code;
    this.name = 'BusinessException';
  }
}
