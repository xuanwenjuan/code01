import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestException } from '../exceptions/HttpException';

export type ValidationSchema = {
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  body?: Joi.ObjectSchema;
};

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(d => `参数 ${d.path.join('.')}: ${d.message}`));
      }
    }

    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(d => `查询 ${d.path.join('.')}: ${d.message}`));
      }
    }

    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(d => `请求体 ${d.path.join('.')}: ${d.message}`));
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('; '));
    }

    next();
  };
};

export const validateAsync = async (data: any, schema: Joi.ObjectSchema): Promise<void> => {
  try {
    await schema.validateAsync(data, { abortEarly: false });
  } catch (error: any) {
    const errors = error.details.map((d: any) => d.message);
    throw new BadRequestException(errors.join('; '));
  }
};
