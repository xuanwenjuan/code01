import { Router } from 'express';
import { body } from 'express-validator';
import {
  getUserList,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
} from '../controllers/user.controller';
import { authMiddleware, validationMiddleware, operationLogMiddleware, roleMiddleware } from '../middleware';
import { UserRole } from '../common/enums';

const router = Router();

router.get('/', authMiddleware, roleMiddleware(UserRole.ADMIN), getUserList);
router.get('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), getUserById);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  operationLogMiddleware({ module: 'user', operation: 'create' }),
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
    body('realName').notEmpty().withMessage('真实姓名不能为空'),
    body('phone').notEmpty().withMessage('手机号不能为空'),
  ],
  validationMiddleware,
  createUser
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  operationLogMiddleware({ module: 'user', operation: 'update' }),
  updateUser
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  operationLogMiddleware({ module: 'user', operation: 'delete' }),
  deleteUser
);

router.put(
  '/password/change',
  authMiddleware,
  operationLogMiddleware({ module: 'user', operation: 'changePassword' }),
  [
    body('oldPassword').notEmpty().withMessage('原密码不能为空'),
    body('newPassword').isLength({ min: 6 }).withMessage('新密码长度不能少于6位'),
  ],
  validationMiddleware,
  changePassword
);

export default router;