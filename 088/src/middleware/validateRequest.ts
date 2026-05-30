import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

export interface ValidationSchemas {
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  body?: Joi.ObjectSchema;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    };

    const errors: string[] = [];

    if (schemas.params) {
      const { error } = schemas.params.validate(req.params, validationOptions);
      if (error) {
        errors.push(...error.details.map((d) => `params: ${d.message}`));
      }
    }

    if (schemas.query) {
      const { error } = schemas.query.validate(req.query, validationOptions);
      if (error) {
        errors.push(...error.details.map((d) => `query: ${d.message}`));
      }
    }

    if (schemas.body) {
      const { error } = schemas.body.validate(req.body, validationOptions);
      if (error) {
        errors.push(...error.details.map((d) => `body: ${d.message}`));
      }
    }

    if (errors.length > 0) {
      throw new AppError(`请求参数验证失败: ${errors.join('; ')}`, 400);
    }

    next();
  };
};

export const validateRequestAsync = (schemas: ValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      validateRequest(schemas)(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export const commonSchemas = {
  idParam: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'ID必须是数字',
      'number.integer': 'ID必须是整数',
      'number.positive': 'ID必须是正整数',
      'any.required': 'ID是必填项'
    })
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': '页码必须是数字',
      'number.integer': '页码必须是整数',
      'number.min': '页码必须大于等于1'
    }),
    pageSize: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': '每页数量必须是数字',
      'number.integer': '每页数量必须是整数',
      'number.min': '每页数量必须大于等于1',
      'number.max': '每页数量不能超过100'
    })
  }),

  dateRange: Joi.object({
    startDate: Joi.date().iso().optional().messages({
      'date.base': '开始日期格式不正确',
      'date.iso': '开始日期必须是ISO格式'
    }),
    endDate: Joi.date().iso().optional().messages({
      'date.base': '结束日期格式不正确',
      'date.iso': '结束日期必须是ISO格式'
    })
  }).custom((value, helpers) => {
    if (value.startDate && value.endDate && new Date(value.startDate) > new Date(value.endDate)) {
      return helpers.error('date.range', { message: '开始日期不能晚于结束日期' });
    }
    return value;
  })
};
