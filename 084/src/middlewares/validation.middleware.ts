import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationException } from '../exceptions/AppException';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: (err as any).path || err.param,
      message: err.msg
    }));
    throw new ValidationException(formattedErrors);
  }
  next();
};