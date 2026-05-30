import { body, param, query } from 'express-validator';

export const idParam = [
  param('id').isInt({ min: 1 }).withMessage('ID必须为正整数')
];

export const handleAlertValidationRules = [
  param('id').isInt({ min: 1 }).withMessage('ID必须为正整数'),
  body('handleRemark').optional().isLength({ max: 1000 }).withMessage('处理备注不能超过1000个字符')
];

export const alertQueryRules = [
  query('isHandled').optional().isBoolean().withMessage('是否已处理必须为布尔值'),
  query('workshop').optional().isLength({ max: 100 }).withMessage('车间不能超过100个字符'),
  query('categoryId').optional().isInt({ min: 1 }).withMessage('分类ID必须为正整数'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数必须在1-100之间')
];
