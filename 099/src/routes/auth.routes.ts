import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate, requireRole, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import Joi from 'joi';

const router = Router();

const loginSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  })
});

const registerSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
    realName: Joi.string().required(),
    phone: Joi.string().optional(),
    role: Joi.string().valid('admin', 'trainer', 'warehouse', 'purchaser').required()
  })
});

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', authenticate, requireRole('admin'), validate(registerSchema), authController.register);
router.get('/profile', authenticate, authController.getProfile);
router.get('/users', authenticate, requireRole('admin'), authController.getUsers);
router.get('/users/:id', authenticate, requireRole('admin'), authController.getUser);
router.put('/users/:id', authenticate, requireRole('admin'), authController.updateUser);
router.delete('/users/:id', authenticate, requireRole('admin'), authController.deleteUser);

export default router;
