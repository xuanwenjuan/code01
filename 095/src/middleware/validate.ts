import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';
import { validationErrorResponse } from '../utils/response';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map(err => ({
      field: (err as any).path,
      message: err.msg,
      value: (err as any).value,
    }));

    return res.status(400).json(validationErrorResponse(formattedErrors));
  };
};

export const validateId = (field: string = 'id') => {
  return param(field).isInt({ min: 1 }).withMessage(`${field} 必须是正整数`);
};

export const validatePagination = () => {
  return [
    query('page').optional().isInt({ min: 1 }).withMessage('page 必须是正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('pageSize 必须在 1-100 之间'),
    query('sortBy').optional().isString().withMessage('sortBy 必须是字符串'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder 必须是 asc 或 desc'),
  ];
};

export const validateDateRange = (startField: string = 'startDate', endField: string = 'endDate') => {
  return [
    query(startField).optional().isISO8601().withMessage(`${startField} 格式不正确`),
    query(endField).optional().isISO8601().withMessage(`${endField} 格式不正确`),
  ];
};

export const commonValidations = {
  requiredString: (field: string, min: number = 1, max: number = 255) =>
    body(field).notEmpty().withMessage(`${field} 不能为空`).trim().isLength({ min, max }).withMessage(`${field} 长度应在 ${min}-${max} 字符之间`),

  optionalString: (field: string, max: number = 255) =>
    body(field).optional().trim().isLength({ max }).withMessage(`${field} 长度不能超过 ${max} 字符`),

  requiredInt: (field: string, min: number = 1) =>
    body(field).isInt({ min }).withMessage(`${field} 必须是大于等于 ${min} 的整数`),

  optionalInt: (field: string, min: number = 0) =>
    body(field).optional().isInt({ min }).withMessage(`${field} 必须是大于等于 ${min} 的整数`),

  requiredFloat: (field: string, min: number = 0) =>
    body(field).isFloat({ min }).withMessage(`${field} 必须是大于等于 ${min} 的数字`),

  optionalFloat: (field: string, min: number = 0) =>
    body(field).optional().isFloat({ min }).withMessage(`${field} 必须是大于等于 ${min} 的数字`),

  requiredEmail: (field: string = 'email') =>
    body(field).isEmail().withMessage('邮箱格式不正确'),

  requiredPhone: (field: string = 'phone') =>
    body(field).optional().isLength({ max: 20 }).withMessage('电话长度不能超过 20 字符'),

  requiredEnum: (field: string, enumValues: any[], enumName: string = field) =>
    body(field).isIn(enumValues).withMessage(`${enumName} 值无效，有效值：${enumValues.join(', ')}`),

  optionalEnum: (field: string, enumValues: any[], enumName: string = field) =>
    body(field).optional().isIn(enumValues).withMessage(`${enumName} 值无效，有效值：${enumValues.join(', ')}`),

  requiredArray: (field: string, minLength: number = 1) =>
    body(field).isArray({ min: minLength }).withMessage(`${field} 必须是至少包含 ${minLength} 个元素的数组`),

  optionalArray: (field: string) =>
    body(field).optional().isArray().withMessage(`${field} 必须是数组格式`),

  requiredBoolean: (field: string) =>
    body(field).isBoolean().withMessage(`${field} 必须是布尔值`),

  optionalBoolean: (field: string) =>
    body(field).optional().isBoolean().withMessage(`${field} 必须是布尔值`),

  requiredUrl: (field: string) =>
    body(field).isURL().withMessage(`${field} 必须是有效的 URL`),

  optionalUrl: (field: string) =>
    body(field).optional().isURL().withMessage(`${field} 必须是有效的 URL`),
};
