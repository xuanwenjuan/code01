export class AppException extends Error {
  public readonly code: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: number = 500, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestException extends AppException {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundException extends AppException {
  constructor(message: string = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictException extends AppException {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

export class ValidationException extends AppException {
  public readonly errors: any[];

  constructor(errors: any[], message: string = 'Validation Error') {
    super(message, 422);
    this.errors = errors;
  }
}