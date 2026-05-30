import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { operationLogMiddleware } from '../middlewares/operation-log.middleware';
import { OperationType } from '../models/operation-log.model';

const router = Router();

router.post(
  '/login',
  operationLogMiddleware({ module: 'auth', operation: OperationType.READ, description: '用户登录' }),
  ...authController.login
);

router.post(
  '/register',
  operationLogMiddleware({ module: 'auth', operation: OperationType.CREATE, description: '用户注册' }),
  ...authController.register
);

router.get(
  '/me',
  authMiddleware,
  ...authController.getCurrentUser
);

export default router;
