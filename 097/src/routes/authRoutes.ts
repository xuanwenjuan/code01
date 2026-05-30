import { Router } from 'express';
import { login, getCurrentUser, changePassword, loginSchema, changePasswordSchema } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/change-password', authMiddleware, validate(changePasswordSchema), changePassword);

export default router;
