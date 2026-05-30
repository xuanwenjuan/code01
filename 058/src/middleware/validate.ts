import { Request, Response, NextFunction } from 'express';
import { Schema, ValidationOptions } from 'joi';
import { Result } from '../utils/response';
import { ErrorCode } from '../utils/businessError';

type ValidateTarget = 'body' | 'query' | 'params' | 'all';

const defaultOptions: ValidationOptions = {
  abortEarly: false,
  stripUnknown: true,
  convert: true
};

export const validate = (
  schema: Schema,
  target: ValidateTarget = 'all',
  options: ValidationOptions = defaultOptions
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let data: any;
    
    switch (target) {
      case 'body':
        data = req.body;
        break;
      case 'query':
        data = req.query;
        break;
      case 'params':
        data = req.params;
        break;
      default:
        data = { ...req.body, ...req.query, ...req.params };
    }

    const { error, value } = schema.validate(data, options);

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return Result.sendError(res, errors.join('; '), ErrorCode.VALIDATION_ERROR);
    }

    if (target === 'body') {
      req.body = value;
    } else if (target === 'query') {
      req.query = value;
    } else if (target === 'params') {
      req.params = value;
    }

    next();
  };
};

export const validateBody = (schema: Schema, options?: ValidationOptions) =>
  validate(schema, 'body', options);

export const validateQuery = (schema: Schema, options?: ValidationOptions) =>
  validate(schema, 'query', options);

export const validateParams = (schema: Schema, options?: ValidationOptions) =>
  validate(schema, 'params', options);
