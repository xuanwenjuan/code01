import { Router } from 'express';
import { register, login, getCurrentUser, changePassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { authSchemas } from '../validation/schemas';

const router = Router();

router.post('/register', validateRequest({ body: authSchemas.register }), register);
router.post('/login', validateRequest({ body: authSchemas.login }), login);
router.get('/me', authenticate, getCurrentUser);
router.put('/change-password', authenticate, validateRequest({ body: authSchemas.changePassword }), changePassword);

export default router;
