import express from 'express';
import Joi from 'joi';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../utils/validation';

const router = express.Router();

const registerSchema = Joi.object({
  username: Joi.string().required().max(50),
  password: Joi.string().required().min(6),
  realName: Joi.string().required().max(50),
  phone: Joi.string().required().max(20),
  email: Joi.string().email().max(100).optional(),
  roleId: Joi.number().integer().required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(6)
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/init', authController.initSystem);

export default router;
