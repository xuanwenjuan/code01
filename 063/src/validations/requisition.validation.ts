import { body, param, query } from 'express-validator';

export const createRequisitionValidation = [
  body('reason').optional().isLength({ max: 500 }).withMessage('申领原因不能超过500个字符'),
  body('items').isArray({ min: 1 }).withMessage('申领物资不能为空'),
  body('items.*.materialId').isInt().withMessage('物资ID必须为数字'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('申领数量必须大于0')
];

export const approveRequisitionValidation = [
  param('id').isInt().withMessage('申领单ID必须为数字'),
  body('rejectReason').optional().isLength({ max: 500 }).withMessage('驳回原因不能超过500个字符')
];

export const requisitionIdValidation = [
  param('id').isInt().withMessage('申领单ID必须为数字')
];

export const getRequisitionListValidation = [
  query('status').optional().isInt().withMessage('状态必须为数字'),
  query('departmentId').optional().isInt().withMessage('部门ID必须为数字'),
  query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
  query('endDate').optional().isISO8601().withMessage('结束日期格式不正确')
];