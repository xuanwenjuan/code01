import { Router } from 'express';
import { body } from 'express-validator';
import { login, getCurrentUser, initAdmin } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post(
  '/login',
  validate([
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
  ]),
  login
);

router.get('/me', authenticate, getCurrentUser);
router.post('/init-admin', initAdmin);

export default router;