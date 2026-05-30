import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (schema: Joi.ObjectSchema | Joi.ArraySchema, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = target === 'body' ? req.body : target === 'query' ? req.query : req.params;
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return next(new AppError(errors.join(', '), 400));
    }

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return validate(schema, 'query');
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return validate(schema, 'params');
};
