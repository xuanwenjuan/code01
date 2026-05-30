import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ValidationException } from '../exceptions/AppException';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate({
      body: req.body,
      query: req.query,
      params: req.params
    }, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message).join(', ');
      throw new ValidationException(errors);
    }

    next();
  };
};
