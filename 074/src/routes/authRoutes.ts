import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { authValidation } from '../middleware/validationRules';

const router = Router();

router.post(
  '/login',
  operationLog('认证'),
  validate(authValidation.login),
  authController.login
);

router.post(
  '/change-password',
  authenticate,
  operationLog('认证'),
  validate(authValidation.changePassword),
  authController.changePassword
);

router.get('/me', authenticate, authController.getCurrentUser);

export default router;
