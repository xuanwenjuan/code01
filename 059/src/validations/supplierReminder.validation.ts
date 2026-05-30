import { body, param, query } from 'express-validator';

export const idParam = [
  param('id').isInt({ min: 1 }).withMessage('ID必须为正整数')
];

export const handleReminderValidationRules = [
  param('id').isInt({ min: 1 }).withMessage('ID必须为正整数'),
  body('handleRemark').optional().isLength({ max: 1000 }).withMessage('处理备注不能超过1000个字符')
];

export const markAsReadValidationRules = [
  body('ids').isArray({ min: 1 }).withMessage('请选择至少一条提醒记录'),
  body('ids.*').isInt({ min: 1 }).withMessage('ID格式不正确')
];

export const reminderQueryRules = [
  query('isRead').optional().isBoolean().withMessage('是否已读必须为布尔值'),
  query('isHandled').optional().isBoolean().withMessage('是否已处理必须为布尔值'),
  query('reminderLevel').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('提醒级别不正确'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数必须在1-100之间')
];
