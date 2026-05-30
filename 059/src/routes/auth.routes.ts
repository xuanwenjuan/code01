import { Router } from 'express';
import { login, getCurrentUser, initAdmin } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { loginValidationRules } from '../validations/auth.validation';

const router = Router();

router.post('/login', validate(loginValidationRules), login);
router.get('/me', authenticate, getCurrentUser);
router.post('/init-admin', initAdmin);

export default router;
