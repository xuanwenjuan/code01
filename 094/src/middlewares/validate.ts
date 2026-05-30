import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { badRequestError } from '../utils/response';

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(', ');
      next(badRequestError(errorMessages));
      return;
    }

    next();
  };
};

export const validateParams = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(', ');
      next(badRequestError(errorMessages));
      return;
    }

    next();
  };
};

export const validateQuery = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
    });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(', ');
      next(badRequestError(errorMessages));
      return;
    }

    next();
  };
};
