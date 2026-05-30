import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
    body('realName').notEmpty().withMessage('真实姓名不能为空'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  validate,
  authController.login
);

router.get('/profile', authenticate, authController.getProfile);
router.post(
  '/change-password',
  authenticate,
  [
    body('oldPassword').notEmpty().withMessage('原密码不能为空'),
    body('newPassword').notEmpty().withMessage('新密码不能为空'),
  ],
  validate,
  authController.changePassword
);

export default router;
