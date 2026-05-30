import Joi from 'joi';
import { UserRole } from '../types';

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(50).required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '请输入有效的手机号'
  }),
  role: Joi.string().valid(...Object.values(UserRole)).default(UserRole.USER)
});

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});
