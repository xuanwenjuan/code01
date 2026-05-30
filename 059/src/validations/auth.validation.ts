import { body } from 'express-validator';

export const loginValidationRules = [
  body('username').notEmpty().withMessage('用户名不能为空').isLength({ max: 50 }).withMessage('用户名不能超过50个字符'),
  body('password').notEmpty().withMessage('密码不能为空').isLength({ max: 50 }).withMessage('密码不能超过50个字符')
];
