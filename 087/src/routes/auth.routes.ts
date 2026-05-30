import { Router } from 'express';
import { body, query } from 'express-validator';
import authController from '../controllers/auth.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
  ],
  validate,
  authController.login
);

router.post(
  '/register',
  roleMiddleware(UserRole.ADMIN),
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
    body('realName').notEmpty().withMessage('真实姓名不能为空'),
    body('phone').notEmpty().withMessage('手机号不能为空')
  ],
  validate,
  authController.register
);

router.use(authMiddleware);

router.post(
  '/change-password',
  [
    body('oldPassword').notEmpty().withMessage('原密码不能为空'),
    body('newPassword').notEmpty().withMessage('新密码不能为空')
  ],
  validate,
  authController.changePassword
);

router.get('/user-info', authController.getUserInfo);

router.get(
  '/users',
  roleMiddleware(UserRole.ADMIN),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
  ],
  validate,
  authController.getUserList
);

router.put(
  '/users/:id',
  roleMiddleware(UserRole.ADMIN),
  authController.updateUser
);

router.delete(
  '/users/:id',
  roleMiddleware(UserRole.ADMIN),
  authController.deleteUser
);

export default router;
