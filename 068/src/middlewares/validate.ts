import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseUtil } from '../utils/response';

interface ValidationSchemas {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    if (schemas.body) {
      const { error } = schemas.body.validate(req.body, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map((d) => d.message));
      }
    }

    if (schemas.params) {
      const { error } = schemas.params.validate(req.params, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map((d) => d.message));
      }
    }

    if (schemas.query) {
      const { error } = schemas.query.validate(req.query, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map((d) => d.message));
      }
    }

    if (errors.length > 0) {
      return ResponseUtil.validationError(res, errors);
    }

    next();
  };
};

export const validateIdParam = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID 必须是数字',
    'number.integer': 'ID 必须是整数',
    'number.positive': 'ID 必须大于0',
    'any.required': 'ID 不能为空',
  }),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().positive().default(1).messages({
    'number.base': '页码必须是数字',
    'number.integer': '页码必须是整数',
    'number.positive': '页码必须大于0',
  }),
  pageSize: Joi.number().integer().positive().max(100).default(10).messages({
    'number.base': '每页条数必须是数字',
    'number.integer': '每页条数必须是整数',
    'number.positive': '每页条数必须大于0',
    'number.max': '每页条数不能超过100',
  }),
});

export const commonValidation = {
  name: Joi.string().min(1).max(100).required().messages({
    'string.base': '名称必须是字符串',
    'string.empty': '名称不能为空',
    'string.max': '名称长度不能超过100',
    'any.required': '名称不能为空',
  }),
  status: Joi.number().valid(0, 1).default(1).messages({
    'any.only': '状态只能是0或1',
  }),
  sort: Joi.number().integer().default(0).messages({
    'number.base': '排序必须是数字',
  }),
  price: Joi.number().positive().precision(2).required().messages({
    'number.base': '价格必须是数字',
    'number.positive': '价格必须大于0',
    'any.required': '价格不能为空',
  }),
  stock: Joi.number().integer().min(0).required().messages({
    'number.base': '库存必须是数字',
    'number.integer': '库存必须是整数',
    'number.min': '库存不能小于0',
    'any.required': '库存不能为空',
  }),
};
