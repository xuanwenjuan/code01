import { Router } from 'express';
import { login, register, getCurrentUser, loginSchema, registerSchema } from '../controllers/auth.controller';
import { auth, validate } from '../middleware';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.get('/me', auth, getCurrentUser);

export default router;
