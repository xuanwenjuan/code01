import express from 'express';
import { register, login, getProfile, changePassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { validate, schemas } from '../middleware/validate';

const router = express.Router();

router.post('/register', validate(schemas.auth.register, 'body'), operationLog('auth', '用户注册'), register);
router.post('/login', validate(schemas.auth.login, 'body'), operationLog('auth', '用户登录'), login);
router.get('/profile', authenticate, getProfile);
router.put('/change-password', authenticate, validate(schemas.auth.changePassword, 'body'), operationLog('auth', '修改密码'), changePassword);

export default router;
