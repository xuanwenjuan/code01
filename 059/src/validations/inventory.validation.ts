import { body, param, query } from 'express-validator';

export const idParam = [
  param('id').isInt({ min: 1 }).withMessage('ID必须为正整数')
];

export const sparePartValidationRules = {
  create: [
    body('name').notEmpty().withMessage('备件名称不能为空').isLength({ max: 200 }).withMessage('备件名称不能超过200个字符'),
    body('code').notEmpty().withMessage('备件编码不能为空').isLength({ max: 50 }).withMessage('备件编码不能超过50个字符'),
    body('categoryId').notEmpty().withMessage('分类ID不能为空').isInt({ min: 1 }).withMessage('分类ID必须为正整数'),
    body('specification').optional().isLength({ max: 200 }).withMessage('规格不能超过200个字符'),
    body('model').optional().isLength({ max: 200 }).withMessage('型号不能超过200个字符'),
    body('unit').notEmpty().withMessage('单位不能为空').isLength({ max: 20 }).withMessage('单位不能超过20个字符'),
    body('brand').optional().isLength({ max: 100 }).withMessage('品牌不能超过100个字符'),
    body('safetyStock').optional().isFloat({ min: 0 }).withMessage('安全库存必须为非负数'),
    body('currentStock').optional().isFloat({ min: 0 }).withMessage('当前库存必须为非负数'),
    body('unitPrice').optional().isFloat({ min: 0 }).withMessage('单价必须为非负数'),
    body('workshop').optional().isLength({ max: 100 }).withMessage('车间不能超过100个字符'),
    body('location').optional().isLength({ max: 200 }).withMessage('存放位置不能超过200个字符'),
    body('description').optional().isLength({ max: 1000 }).withMessage('描述不能超过1000个字符'),
    body('isEnabled').optional().isBoolean().withMessage('是否启用必须为布尔值')
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID必须为正整数'),
    body('name').optional().isLength({ max: 200 }).withMessage('备件名称不能超过200个字符'),
    body('code').optional().isLength({ max: 50 }).withMessage('备件编码不能超过50个字符'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('分类ID必须为正整数'),
    body('specification').optional().isLength({ max: 200 }).withMessage('规格不能超过200个字符'),
    body('model').optional().isLength({ max: 200 }).withMessage('型号不能超过200个字符'),
    body('unit').optional().isLength({ max: 20 }).withMessage('单位不能超过20个字符'),
    body('brand').optional().isLength({ max: 100 }).withMessage('品牌不能超过100个字符'),
    body('safetyStock').optional().isFloat({ min: 0 }).withMessage('安全库存必须为非负数'),
    body('currentStock').optional().isFloat({ min: 0 }).withMessage('当前库存必须为非负数'),
    body('unitPrice').optional().isFloat({ min: 0 }).withMessage('单价必须为非负数'),
    body('workshop').optional().isLength({ max: 100 }).withMessage('车间不能超过100个字符'),
    body('location').optional().isLength({ max: 200 }).withMessage('存放位置不能超过200个字符'),
    body('description').optional().isLength({ max: 1000 }).withMessage('描述不能超过1000个字符'),
    body('isEnabled').optional().isBoolean().withMessage('是否启用必须为布尔值')
  ]
};

export const stockInValidationRules = [
  body('sparePartId').notEmpty().withMessage('备件ID不能为空').isInt({ min: 1 }).withMessage('备件ID必须为正整数'),
  body('quantity').notEmpty().withMessage('入库数量不能为空').isFloat({ min: 0.01 }).withMessage('入库数量必须大于0'),
  body('supplierId').optional().isInt({ min: 1 }).withMessage('供应商ID必须为正整数'),
  body('reason').optional().isLength({ max: 500 }).withMessage('原因不能超过500个字符'),
  body('remark').optional().isLength({ max: 1000 }).withMessage('备注不能超过1000个字符')
];

export const stockOutValidationRules = [
  body('sparePartId').notEmpty().withMessage('备件ID不能为空').isInt({ min: 1 }).withMessage('备件ID必须为正整数'),
  body('quantity').notEmpty().withMessage('出库数量不能为空').isFloat({ min: 0.01 }).withMessage('出库数量必须大于0'),
  body('applicantId').optional().isInt({ min: 1 }).withMessage('申请人ID必须为正整数'),
  body('applicantName').optional().isLength({ max: 50 }).withMessage('申请人姓名不能超过50个字符'),
  body('department').optional().isLength({ max: 100 }).withMessage('领用部门不能超过100个字符'),
  body('reason').optional().isLength({ max: 500 }).withMessage('原因不能超过500个字符'),
  body('remark').optional().isLength({ max: 1000 }).withMessage('备注不能超过1000个字符')
];

export const stockReturnValidationRules = [
  body('sparePartId').notEmpty().withMessage('备件ID不能为空').isInt({ min: 1 }).withMessage('备件ID必须为正整数'),
  body('quantity').notEmpty().withMessage('退库数量不能为空').isFloat({ min: 0.01 }).withMessage('退库数量必须大于0'),
  body('applicantId').optional().isInt({ min: 1 }).withMessage('申请人ID必须为正整数'),
  body('applicantName').optional().isLength({ max: 50 }).withMessage('申请人姓名不能超过50个字符'),
  body('department').optional().isLength({ max: 100 }).withMessage('领用部门不能超过100个字符'),
  body('reason').optional().isLength({ max: 500 }).withMessage('原因不能超过500个字符'),
  body('remark').optional().isLength({ max: 1000 }).withMessage('备注不能超过1000个字符')
];

export const inventoryRecordQueryRules = [
  query('sparePartId').optional().isInt({ min: 1 }).withMessage('备件ID必须为正整数'),
  query('type').optional().isIn(['in', 'out', 'return']).withMessage('类型必须为in、out或return'),
  query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
  query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数必须在1-100之间')
];

export const stockAdjustValidationRules = [
  body('sparePartId').notEmpty().withMessage('备件ID不能为空').isInt({ min: 1 }).withMessage('备件ID必须为正整数'),
  body('adjustType').notEmpty().withMessage('调整类型不能为空').isIn(['increase', 'decrease']).withMessage('调整类型必须为increase或decrease'),
  body('quantity').notEmpty().withMessage('调整数量不能为空').isFloat({ min: 0.01 }).withMessage('调整数量必须大于0'),
  body('reason').optional().isLength({ max: 500 }).withMessage('原因不能超过500个字符'),
  body('remark').optional().isLength({ max: 1000 }).withMessage('备注不能超过1000个字符')
];

export const batchStockInValidationRules = [
  body('items').isArray({ min: 1 }).withMessage('请选择至少一个备件'),
  body('items.*.sparePartId').notEmpty().withMessage('备件ID不能为空').isInt({ min: 1 }).withMessage('备件ID必须为正整数'),
  body('items.*.quantity').notEmpty().withMessage('数量不能为空').isFloat({ min: 0.01 }).withMessage('数量必须大于0'),
  body('items.*.reason').optional().isLength({ max: 500 }).withMessage('原因不能超过500个字符'),
  body('supplierId').optional().isInt({ min: 1 }).withMessage('供应商ID必须为正整数'),
  body('remark').optional().isLength({ max: 1000 }).withMessage('备注不能超过1000个字符')
];
