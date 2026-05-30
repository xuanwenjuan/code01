import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { BadRequestException } from '../exceptions/base.exception';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false
    });

    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      throw new BadRequestException(messages);
    }

    next();
  };
};

export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      throw new BadRequestException(messages);
    }

    next();
  };
};

export const validateParams = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      allowUnknown: false
    });

    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      throw new BadRequestException(messages);
    }

    next();
  };
};
