export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
}

export class ResponseUtil {
  static success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
      success: true,
    };
  }

  static error(message: string = '操作失败', code: number = 500): ApiResponse {
    return {
      code,
      message,
      success: false,
    };
  }

  static page<T>(list: T[], total: number, page: number, pageSize: number): ApiResponse<{ list: T[]; total: number; page: number; pageSize: number }> {
    return {
      code: 200,
      message: '查询成功',
      data: {
        list,
        total,
        page,
        pageSize,
      },
      success: true,
    };
  }
}