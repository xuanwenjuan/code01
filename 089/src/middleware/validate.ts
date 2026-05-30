import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { BadRequestError } from '../utils/error';
import logger from '../config/logger';

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
}

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const errorDetails: ValidationErrorDetail[] = errors.array().map(err => {
        if ('path' in err) {
          return {
            field: err.path,
            message: err.msg,
            value: ('value' in err) ? err.value : undefined
          };
        }
        return {
          field: 'unknown',
          message: err.msg
        };
      });

      const errorMessages = errorDetails
        .map(e => `${e.field}: ${e.message}`)
        .join('; ');

      logger.warn('参数验证失败', {
        path: req.path,
        method: req.method,
        errors: errorDetails
      });

      next(new BadRequestError(errorMessages));
    } catch (error) {
      logger.error('验证中间件执行错误', error);
      next(new BadRequestError('参数验证过程中发生错误'));
    }
  };
};

export const sanitizeInput = (input: string): string => {
  if (!input) return input;
  return input
    .replace(/[<>]/g, '')
    .trim();
};

export const validateId = (id: any): boolean => {
  return Number.isInteger(Number(id)) && Number(id) > 0;
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
};

export const validatePagination = (page: any, pageSize: any): { valid: boolean; page: number; pageSize: number } => {
  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(100, Math.max(1, Number(pageSize) || 10));
  return { valid: true, page: p, pageSize: ps };
};
