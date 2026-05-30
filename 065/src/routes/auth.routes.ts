import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(authController.registerSchema), authController.register);
router.post('/login', validate(authController.loginSchema), authController.login);
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;
