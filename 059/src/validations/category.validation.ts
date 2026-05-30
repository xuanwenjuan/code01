import { body, param } from 'express-validator';

export const idParam = [
  param('id').isInt({ min: 1 }).withMessage('ID必须为正整数')
];

export const categoryValidationRules = {
  create: [
    body('name').notEmpty().withMessage('分类名称不能为空').isLength({ max: 100 }).withMessage('分类名称不能超过100个字符'),
    body('code').notEmpty().withMessage('分类编码不能为空').isLength({ max: 50 }).withMessage('分类编码不能超过50个字符'),
    body('parentId').optional().isInt({ min: 1 }).withMessage('父分类ID必须为正整数'),
    body('sort').optional().isInt({ min: 0 }).withMessage('排序必须为非负整数'),
    body('description').optional().isLength({ max: 500 }).withMessage('描述不能超过500个字符'),
    body('isEnabled').optional().isBoolean().withMessage('是否启用必须为布尔值')
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID必须为正整数'),
    body('name').optional().isLength({ max: 100 }).withMessage('分类名称不能超过100个字符'),
    body('code').optional().isLength({ max: 50 }).withMessage('分类编码不能超过50个字符'),
    body('parentId').optional().isInt({ min: 1 }).withMessage('父分类ID必须为正整数'),
    body('sort').optional().isInt({ min: 0 }).withMessage('排序必须为非负整数'),
    body('description').optional().isLength({ max: 500 }).withMessage('描述不能超过500个字符'),
    body('isEnabled').optional().isBoolean().withMessage('是否启用必须为布尔值')
  ]
};
