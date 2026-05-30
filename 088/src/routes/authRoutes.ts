import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { logOperation } from '../middleware/operationLog';
import { validate } from '../middleware/validation';
import { loginSchema, createUserSchema, updateUserSchema, idParamSchema } from '../validation/schemas';
import { UserRole } from '../types';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);

router.get('/users/me', authenticate, authController.getCurrentUser);

router.get('/users', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  authController.getAllUsers
);

router.post('/users',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createUserSchema),
  logOperation('用户管理', '创建用户'),
  authController.createUser
);

router.put('/users/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(idParamSchema, 'params'),
  validate(updateUserSchema),
  logOperation('用户管理', '更新用户'),
  authController.updateUser
);

router.delete('/users/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(idParamSchema, 'params'),
  logOperation('用户管理', '删除用户'),
  authController.deleteUser
);

export default router;
