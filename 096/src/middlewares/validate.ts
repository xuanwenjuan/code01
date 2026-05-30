import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseUtil } from '../utils/response';

export enum ValidateType {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params'
}

export const validate = (
  schema: Joi.ObjectSchema,
  type: ValidateType = ValidateType.BODY
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = type === ValidateType.BODY 
      ? req.body 
      : type === ValidateType.QUERY 
        ? req.query 
        : req.params;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        code: 400,
        message: '参数验证失败',
        errors,
        success: false,
        timestamp: Date.now()
      });
    }

    if (type === ValidateType.BODY) {
      req.body = value;
    } else if (type === ValidateType.QUERY) {
      req.query = value;
    } else {
      req.params = value;
    }

    next();
  };
};

export const validateBody = (schema: Joi.ObjectSchema) => validate(schema, ValidateType.BODY);
export const validateQuery = (schema: Joi.ObjectSchema) => validate(schema, ValidateType.QUERY);
export const validateParams = (schema: Joi.ObjectSchema) => validate(schema, ValidateType.PARAMS);
