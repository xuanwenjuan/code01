import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { badRequest } from '../utils/response';

export const validate = (schema: Joi.Schema, location: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = location === 'body' ? req.body : location === 'query' ? req.query : req.params;
    const { error } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message).join(', ');
      return badRequest(res, errors);
    }
    
    next();
  };
};
