import { Router } from 'express';
import { body } from 'express-validator';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword
} from '../controllers/user.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireRoles } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRoles(UserRole.ADMIN),
  validate([
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
    body('realName').notEmpty().withMessage('真实姓名不能为空'),
    body('role').notEmpty().withMessage('用户角色不能为空')
  ]),
  createUser
);

router.get('/', requireRoles(UserRole.ADMIN), getUsers);
router.get('/:id', requireRoles(UserRole.ADMIN), getUserById);

router.put('/:id', requireRoles(UserRole.ADMIN), updateUser);
router.delete('/:id', requireRoles(UserRole.ADMIN), deleteUser);

router.post(
  '/change-password',
  validate([
    body('oldPassword').notEmpty().withMessage('原密码不能为空'),
    body('newPassword').notEmpty().withMessage('新密码不能为空')
  ]),
  changePassword
);

export default router;