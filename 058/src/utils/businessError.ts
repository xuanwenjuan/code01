export enum ErrorCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  INTERNAL_ERROR = 500,
  ORDER_STATUS_ERROR = 1001,
  ORDER_RIDER_MISMATCH = 1002,
  RIDER_STATUS_ERROR = 2001,
  RIDER_DELIVERY_AREA_REQUIRED = 2002,
  CATEGORY_HAS_ACTIVE_ORDERS = 3001,
  SETTLEMENT_ALREADY_EXISTS = 4001,
  SETTLEMENT_STATUS_ERROR = 4002,
  INSUFFICIENT_BALANCE = 4003
}

export class BusinessError extends Error {
  public code: number;

  constructor(message: string, code: number = ErrorCode.BAD_REQUEST) {
    super(message);
    this.code = code;
    this.name = 'BusinessError';
    Object.setPrototypeOf(this, BusinessError.prototype);
  }

  static unauthorized(message: string = '未授权，请先登录'): BusinessError {
    return new BusinessError(message, ErrorCode.UNAUTHORIZED);
  }

  static forbidden(message: string = '权限不足'): BusinessError {
    return new BusinessError(message, ErrorCode.FORBIDDEN);
  }

  static notFound(message: string = '资源不存在'): BusinessError {
    return new BusinessError(message, ErrorCode.NOT_FOUND);
  }

  static validation(message: string = '参数验证失败'): BusinessError {
    return new BusinessError(message, ErrorCode.VALIDATION_ERROR);
  }
}
