import { Router } from 'express';
import { body } from 'express-validator';
import userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN),
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
    body('realName').notEmpty().withMessage('真实姓名不能为空'),
    body('role').isIn(Object.values(UserRole)).withMessage('无效的用户角色'),
  ],
  validate,
  userController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  userController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  userController.delete
);

router.patch(
  '/:id/reset-password',
  authorize(UserRole.ADMIN),
  [
    body('newPassword').notEmpty().withMessage('新密码不能为空'),
  ],
  validate,
  userController.resetPassword
);

router.get('/:id', userController.findById);
router.get('/', userController.findAll);

export default router;
