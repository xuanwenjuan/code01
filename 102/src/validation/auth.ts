import Joi from 'joi';
import { UserRole } from '../constants';

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': '用户名不能为空',
  }),
  password: Joi.string().required().messages({
    'any.required': '密码不能为空',
  }),
});

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.min': '用户名至少3个字符',
    'string.max': '用户名最多50个字符',
    'any.required': '用户名不能为空',
  }),
  password: Joi.string().min(6).max(50).required().messages({
    'string.min': '密码至少6个字符',
    'string.max': '密码最多50个字符',
    'any.required': '密码不能为空',
  }),
  realName: Joi.string().required().messages({
    'any.required': '真实姓名不能为空',
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '手机号格式不正确',
    'any.required': '手机号不能为空',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': '邮箱格式不正确',
  }),
  role: Joi.string().valid(...Object.values(UserRole)).required().messages({
    'any.required': '角色不能为空',
    'any.only': '角色值不正确',
  }),
});

export const updateUserSchema = Joi.object({
  realName: Joi.string().optional(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
    'string.pattern.base': '手机号格式不正确',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': '邮箱格式不正确',
  }),
  avatar: Joi.string().optional(),
  status: Joi.boolean().optional(),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': '旧密码不能为空',
  }),
  newPassword: Joi.string().min(6).max(50).required().messages({
    'string.min': '新密码至少6个字符',
    'string.max': '新密码最多50个字符',
    'any.required': '新密码不能为空',
  }),
});
