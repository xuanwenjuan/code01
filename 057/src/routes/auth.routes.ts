import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { loginSchema, changePasswordSchema, createUserSchema, refreshTokenSchema } from '../validation/auth.validation';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.get('/me', authenticate, authController.getCurrentUser);

router.use(requireAdmin);
router.get('/users', authController.getUserList);
router.post('/users', validate(createUserSchema), authController.createUser);
router.put('/users/:id/status', authController.updateUserStatus);

export default router;
