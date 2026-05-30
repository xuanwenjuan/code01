import { Router } from 'express';
import { login, getCurrentUser, initData } from '../controllers/authController';
import { authenticate, requireRole } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { validate } from '../middleware/validation';
import { loginSchema } from '../validation/authValidation';
import { UserRole } from '../types';

const router = Router();

router.post('/login',
  operationLog({ module: '认证', operation: '登录' }),
  validate(loginSchema),
  login
);

router.get('/me', authenticate, getCurrentUser);

router.post('/init-data',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN),
  operationLog({ module: '系统', operation: '初始化数据' }),
  initData
);

export default router;
