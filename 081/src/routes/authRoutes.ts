import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { login, loginValidation, getCurrentUser } from '../controllers/authController';
import { operationLog } from '../middleware/operationLog';

const router = Router();

router.post(
  '/login',
  validate(loginValidation),
  operationLog('用户登录'),
  login
);

router.get(
  '/me',
  authenticate,
  getCurrentUser
);

export default router;
