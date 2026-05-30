import { Router } from 'express';
import {
  login,
  register,
  getCurrentUser,
  loginSchema,
  registerSchema
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
