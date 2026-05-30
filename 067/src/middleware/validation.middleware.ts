import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';
import { ValidationException } from './error.middleware';
import { ValidationError } from '../types';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors: ValidationError[] = errors.array().map((err: ExpressValidationError) => ({
      field: 'path' in err ? err.path.toString() : 'unknown',
      message: err.msg as string,
    }));

    throw new ValidationException(validationErrors);
  }

  next();
};

export const validationSchemas = {
  id: {
    isInt: true,
    toInt: true,
    errorMessage: 'ID必须是正整数',
  },
  page: {
    optional: true,
    isInt: { options: { min: 1 } },
    toInt: true,
    errorMessage: '页码必须是正整数',
  },
  pageSize: {
    optional: true,
    isInt: { options: { min: 1, max: 100 } },
    toInt: true,
    errorMessage: '每页数量必须是1-100之间的整数',
  },
  username: {
    notEmpty: true,
    isLength: { options: { min: 3, max: 50 } },
    errorMessage: '用户名长度必须在3-50个字符之间',
  },
  password: {
    notEmpty: true,
    isLength: { options: { min: 6 } },
    errorMessage: '密码长度至少6个字符',
  },
  phone: {
    notEmpty: true,
    isMobilePhone: {
      options: ['zh-CN'],
    },
    errorMessage: '请输入有效的手机号码',
  },
  date: {
    optional: true,
    isISO8601: true,
    errorMessage: '日期格式不正确',
  },
  siteId: {
    isInt: true,
    toInt: true,
    errorMessage: '站点ID必须是整数',
  },
  pileId: {
    isInt: true,
    toInt: true,
    errorMessage: '充电桩ID必须是整数',
  },
  orderId: {
    isInt: true,
    toInt: true,
    errorMessage: '订单ID必须是整数',
  },
  keyword: {
    optional: true,
    isString: true,
    trim: true,
    errorMessage: '关键词必须是字符串',
  },
  energy: {
    isFloat: { options: { min: 0 } },
    toFloat: true,
    errorMessage: '充电量必须大于0',
  },
  amount: {
    isFloat: { options: { min: 0 } },
    toFloat: true,
    errorMessage: '金额必须大于0',
  },
};
