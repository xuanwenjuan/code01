import { body, param, query } from 'express-validator';

export const idParam = [
  param('id').isInt({ min: 1 }).withMessage('ID必须为正整数')
];

export const supplierValidationRules = {
  create: [
    body('name').notEmpty().withMessage('供应商名称不能为空').isLength({ max: 200 }).withMessage('供应商名称不能超过200个字符'),
    body('code').notEmpty().withMessage('供应商编码不能为空').isLength({ max: 50 }).withMessage('供应商编码不能超过50个字符'),
    body('contactPerson').notEmpty().withMessage('联系人不能为空').isLength({ max: 50 }).withMessage('联系人不能超过50个字符'),
    body('phone').notEmpty().withMessage('联系电话不能为空').isLength({ max: 20 }).withMessage('联系电话不能超过20个字符'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确').isLength({ max: 100 }).withMessage('邮箱不能超过100个字符'),
    body('address').optional().isLength({ max: 500 }).withMessage('地址不能超过500个字符'),
    body('cooperationStartDate').optional().isISO8601().withMessage('合作开始日期格式不正确'),
    body('cooperationEndDate').optional().isISO8601().withMessage('合作结束日期格式不正确'),
    body('status').optional().isIn(['active', 'expired', 'suspended', 'pending']).withMessage('状态值不正确'),
    body('qualification').optional().isLength({ max: 1000 }).withMessage('资质信息不能超过1000个字符'),
    body('creditRating').optional().isLength({ max: 20 }).withMessage('信用等级不能超过20个字符'),
    body('remark').optional().isLength({ max: 1000 }).withMessage('备注不能超过1000个字符')
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID必须为正整数'),
    body('name').optional().isLength({ max: 200 }).withMessage('供应商名称不能超过200个字符'),
    body('code').optional().isLength({ max: 50 }).withMessage('供应商编码不能超过50个字符'),
    body('contactPerson').optional().isLength({ max: 50 }).withMessage('联系人不能超过50个字符'),
    body('phone').optional().isLength({ max: 20 }).withMessage('联系电话不能超过20个字符'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确').isLength({ max: 100 }).withMessage('邮箱不能超过100个字符'),
    body('address').optional().isLength({ max: 500 }).withMessage('地址不能超过500个字符'),
    body('cooperationStartDate').optional().isISO8601().withMessage('合作开始日期格式不正确'),
    body('cooperationEndDate').optional().isISO8601().withMessage('合作结束日期格式不正确'),
    body('status').optional().isIn(['active', 'expired', 'suspended', 'pending']).withMessage('状态值不正确'),
    body('qualification').optional().isLength({ max: 1000 }).withMessage('资质信息不能超过1000个字符'),
    body('creditRating').optional().isLength({ max: 20 }).withMessage('信用等级不能超过20个字符'),
    body('remark').optional().isLength({ max: 1000 }).withMessage('备注不能超过1000个字符')
  ]
};
