import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errors';

export const commonValidators = {
  id: Joi.number().integer().positive().required(),
  optionalId: Joi.number().integer().positive().optional(),
  name: Joi.string().max(100).required(),
  optionalName: Joi.string().max(100).optional(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '手机号码格式不正确'
  }),
  optionalPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
    'string.pattern.base': '手机号码格式不正确'
  }),
  email: Joi.string().email().max(100).optional(),
  address: Joi.string().max(255).required(),
  optionalAddress: Joi.string().max(255).optional(),
  amount: Joi.number().positive().precision(2).required(),
  optionalAmount: Joi.number().positive().precision(2).optional(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  date: Joi.date().iso().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  sortBy: Joi.string().max(50).optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
  remark: Joi.string().max(500).optional(),
  status: Joi.string().max(20).optional()
};

export const idSchema = Joi.object({
  id: commonValidators.id
});

export const paginationSchema = Joi.object({
  page: commonValidators.page,
  pageSize: commonValidators.pageSize,
  sortBy: commonValidators.sortBy,
  sortOrder: commonValidators.sortOrder
});

export const dateRangeSchema = Joi.object({
  startDate: commonValidators.startDate,
  endDate: commonValidators.endDate
});

const validateOptions = {
  abortEarly: false,
  stripUnknown: true,
  convert: true
};

export const validate = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, validateOptions);
    if (error) {
      const errors = error.details.map(detail => detail.message).join(', ');
      throw new ValidationError(errors);
    }
    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, validateOptions);
    if (error) {
      const errors = error.details.map(detail => detail.message).join(', ');
      throw new ValidationError(errors);
    }
    req.query = value;
    next();
  };
};

export const validateParams = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, validateOptions);
    if (error) {
      const errors = error.details.map(detail => detail.message).join(', ');
      throw new ValidationError(errors);
    }
    req.params = value;
    next();
  };
};

export const validateRequest = (schemas: {
  params?: Joi.Schema;
  query?: Joi.Schema;
  body?: Joi.Schema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, validateOptions);
      if (error) {
        const errors = error.details.map(detail => detail.message).join(', ');
        throw new ValidationError(errors);
      }
      req.params = value;
    }
    
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, validateOptions);
      if (error) {
        const errors = error.details.map(detail => detail.message).join(', ');
        throw new ValidationError(errors);
      }
      req.query = value;
    }
    
    if (schemas.body) {
      const { error, value } = schemas.body.validate(req.body, validateOptions);
      if (error) {
        const errors = error.details.map(detail => detail.message).join(', ');
        throw new ValidationError(errors);
      }
      req.body = value;
    }
    
    next();
  };
};
