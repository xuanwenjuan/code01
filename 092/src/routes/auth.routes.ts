import { Router } from 'express';
import { body } from 'express-validator';
import { login, register, getCurrentUser } from '../controllers/auth.controller';
import { authMiddleware, validationMiddleware } from '../middleware';

const router = Router();

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  validationMiddleware,
  login
);

router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
    body('realName').notEmpty().withMessage('真实姓名不能为空'),
    body('phone').notEmpty().withMessage('手机号不能为空'),
  ],
  validationMiddleware,
  register
);

router.get('/profile', authMiddleware, getCurrentUser);

export default router;