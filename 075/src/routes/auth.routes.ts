
import { Router } from 'express';
import { authValidationRules, login, register, getCurrentUser } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', authValidationRules.login, login);
router.post('/register', authValidationRules.register, register);
router.get('/me', authenticate, getCurrentUser);

export default router;
