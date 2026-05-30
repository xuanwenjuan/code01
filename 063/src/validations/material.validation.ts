import { body, param, query } from 'express-validator';

export const createMaterialValidation = [
  body('name').notEmpty().withMessage('物资名称不能为空'),
  body('name').isLength({ max: 100 }).withMessage('物资名称不能超过100个字符'),
  body('code').notEmpty().withMessage('物资编码不能为空'),
  body('code').isLength({ max: 50 }).withMessage('物资编码不能超过50个字符'),
  body('unit').notEmpty().withMessage('计量单位不能为空'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('单价必须大于等于0'),
  body('categoryId').isInt().withMessage('类目ID必须为数字'),
  body('warehouseId').isInt().withMessage('仓库ID必须为数字'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('库存数量必须大于等于0'),
  body('minStockThreshold').optional().isInt({ min: 0 }).withMessage('最低库存阈值必须大于等于0')
];

export const updateMaterialValidation = [
  param('id').isInt().withMessage('物资ID必须为数字'),
  body('name').optional().isLength({ max: 100 }).withMessage('物资名称不能超过100个字符'),
  body('unitPrice').optional().isFloat({ min: 0 }).withMessage('单价必须大于等于0'),
  body('status').optional().isIn([0, 1]).withMessage('状态值不正确')
];

export const stockInOutValidation = [
  body('materialId').isInt().withMessage('物资ID必须为数字'),
  body('quantity').isInt({ min: 1 }).withMessage('数量必须大于0'),
  body('remark').optional().isLength({ max: 200 }).withMessage('备注不能超过200个字符')
];

export const getMaterialListValidation = [
  query('name').optional().isLength({ max: 100 }).withMessage('搜索名称不能超过100个字符'),
  query('categoryId').optional().isInt().withMessage('类目ID必须为数字'),
  query('warehouseId').optional().isInt().withMessage('仓库ID必须为数字'),
  query('status').optional().isIn([0, 1]).withMessage('状态值不正确')
];