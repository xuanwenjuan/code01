import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { registerSchema, loginSchema } from '../validations/authValidation';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.get('/me', auth, asyncHandler(authController.getCurrentUser));

export default router;
