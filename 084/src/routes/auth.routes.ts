import { Router } from 'express';
import { login, register, getProfile, changePassword, loginValidation, registerValidation } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

router.post('/login', loginValidation, validate, login);
router.post('/register', registerValidation, validate, register);
router.get('/profile', authMiddleware, getProfile);
router.put('/change-password', authMiddleware, changePassword);

export default router;