import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors: Record<string, string> = {};
    errors.array().forEach((error) => {
      if ('path' in error) {
        formattedErrors[error.path] = error.msg;
      }
    });
    throw new ValidationError(formattedErrors);
  }
  next();
};

export const pagination = (req: Request, _res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  req.pagination = {
    page: Math.max(1, page),
    pageSize: Math.min(100, Math.max(1, pageSize)),
  };

  next();
};

declare global {
  namespace Express {
    interface Request {
      pagination: {
        page: number;
        pageSize: number;
      };
    }
  }
}
