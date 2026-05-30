import { Router } from 'express';
import { login, register, getCurrentUser, changePassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema, changePasswordSchema } from '../validation/auth';

const router = Router();

router.post('/login', validate(loginSchema, 'body'), login);
router.post('/register', validate(registerSchema, 'body'), register);
router.get('/me', authenticate, getCurrentUser);
router.put('/change-password', authenticate, validate(changePasswordSchema, 'body'), changePassword);

export default router;
