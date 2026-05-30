import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BusinessException } from '../utils/response';

export class ValidationError extends BusinessException {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export const validate = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(d => d.message));
      }
    }

    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(d => d.message));
      }
    }

    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(d => d.message));
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(`参数验证失败: ${errors.join('; ')}`);
    }

    next();
  };
};

export const commonValidators = {
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID必须是数字',
    'number.integer': 'ID必须是整数',
    'number.positive': 'ID必须是正数',
    'any.required': 'ID是必填项'
  }),
  
  page: Joi.number().integer().positive().default(1).messages({
    'number.base': '页码必须是数字',
    'number.integer': '页码必须是整数',
    'number.positive': '页码必须是正数'
  }),
  
  pageSize: Joi.number().integer().positive().max(100).default(10).messages({
    'number.base': '每页数量必须是数字',
    'number.integer': '每页数量必须是整数',
    'number.positive': '每页数量必须是正数',
    'number.max': '每页数量最大为100'
  }),

  dateRange: {
    startDate: Joi.date().optional().messages({
      'date.base': '开始日期格式不正确'
    }),
    endDate: Joi.date().optional().greater(Joi.ref('startDate')).messages({
      'date.base': '结束日期格式不正确',
      'date.greater': '结束日期必须大于开始日期'
    })
  }
};
