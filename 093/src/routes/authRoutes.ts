import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/login', authController.validateLogin, authController.login);
router.post('/register', authController.validateRegister, authController.register);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
