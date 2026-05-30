import { body, param, query } from 'express-validator';

export const createInventoryCheckValidation = [
  body('warehouseId').isInt().withMessage('仓库ID必须为数字'),
  body('checkDate').isISO8601().withMessage('盘点日期格式不正确'),
  body('remark').optional().isLength({ max: 500 }).withMessage('备注不能超过500个字符')
];

export const updateInventoryItemsValidation = [
  param('id').isInt().withMessage('盘点单ID必须为数字'),
  body('items').isArray().withMessage('盘点明细不能为空'),
  body('items.*.materialId').isInt().withMessage('物资ID必须为数字'),
  body('items.*.actualQuantity').isInt({ min: 0 }).withMessage('实际数量必须大于等于0')
];

export const inventoryCheckIdValidation = [
  param('id').isInt().withMessage('盘点单ID必须为数字')
];

export const recordLossValidation = [
  body('materialId').isInt().withMessage('物资ID必须为数字'),
  body('quantity').isInt({ min: 1 }).withMessage('损耗数量必须大于0'),
  body('remark').optional().isLength({ max: 200 }).withMessage('备注不能超过200个字符')
];

export const getInventoryCheckListValidation = [
  query('warehouseId').optional().isInt().withMessage('仓库ID必须为数字'),
  query('status').optional().isInt().withMessage('状态必须为数字'),
  query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
  query('endDate').optional().isISO8601().withMessage('结束日期格式不正确')
];