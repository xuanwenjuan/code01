import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestException } from '../exceptions/HttpException';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new BadRequestException(errors.join(', '));
    }
    
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new BadRequestException(errors.join(', '));
    }
    
    next();
  };
};
