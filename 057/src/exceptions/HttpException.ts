export class HttpException extends Error {
  public statusCode: number;
  public message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = '请求参数错误') {
    super(400, message);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = '未授权访问') {
    super(401, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = '权限不足') {
    super(403, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = '资源不存在') {
    super(404, message);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = '资源冲突') {
    super(409, message);
  }
}
