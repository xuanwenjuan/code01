import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate, validationRules } from '../middleware/validation';

const router = Router();

router.post(
  '/login',
  [...validationRules.auth.login, validate],
  authController.login
);
router.get('/profile', authenticate, authController.getProfile);

export default router;
