import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate, schemas } from '../middlewares/validation.middleware';

const router = Router();

router.post('/register', validate(schemas.auth.register), AuthController.register);
router.post('/login', validate(schemas.auth.login), AuthController.login);
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/change-password', authMiddleware, validate(schemas.auth.changePassword), AuthController.changePassword);

export default router;
