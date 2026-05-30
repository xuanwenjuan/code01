import { body, param, query } from 'express-validator';

export const createCategoryValidation = [
  body('name').notEmpty().withMessage('类目名称不能为空'),
  body('name').isLength({ max: 50 }).withMessage('类目名称不能超过50个字符'),
  body('code').notEmpty().withMessage('类目编码不能为空'),
  body('code').isLength({ max: 30 }).withMessage('类目编码不能超过30个字符'),
  body('parentId').optional().isInt().withMessage('父类目ID必须为数字'),
  body('sort').optional().isInt().withMessage('排序必须为数字')
];

export const updateCategoryValidation = [
  param('id').isInt().withMessage('类目ID必须为数字'),
  body('name').optional().isLength({ max: 50 }).withMessage('类目名称不能超过50个字符'),
  body('code').optional().isLength({ max: 30 }).withMessage('类目编码不能超过30个字符'),
  body('status').optional().isIn([0, 1]).withMessage('状态值不正确')
];

export const deleteCategoryValidation = [
  param('id').isInt().withMessage('类目ID必须为数字')
];

export const getCategoryListValidation = [
  query('name').optional().isLength({ max: 50 }).withMessage('搜索名称不能超过50个字符'),
  query('status').optional().isIn([0, 1]).withMessage('状态值不正确')
];