import Joi from 'joi';
import { UserRole } from '../models/User';

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': '用户名不能为空',
    'any.required': '用户名是必填项',
  }),
  password: Joi.string().required().messages({
    'string.empty': '密码不能为空',
    'any.required': '密码是必填项',
  }),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'string.empty': '旧密码不能为空',
    'any.required': '旧密码是必填项',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.empty': '新密码不能为空',
    'string.min': '新密码长度不能少于6位',
    'any.required': '新密码是必填项',
  }),
});

export const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.empty': '用户名不能为空',
    'string.min': '用户名长度不能少于3位',
    'string.max': '用户名长度不能超过50位',
    'any.required': '用户名是必填项',
  }),
  password: Joi.string().min(6).max(50).required().messages({
    'string.empty': '密码不能为空',
    'string.min': '密码长度不能少于6位',
    'string.max': '密码长度不能超过50位',
    'any.required': '密码是必填项',
  }),
  email: Joi.string().email().optional().allow(null, '').messages({
    'string.email': '邮箱格式不正确',
  }),
  phone: Joi.string().optional().allow(null, '').messages({
    'string.base': '手机号必须是字符串',
  }),
  role: Joi.string().valid(...Object.values(UserRole)).required().messages({
    'any.only': '角色必须是 admin、manager 或 employee',
    'any.required': '角色是必填项',
  }),
  employeeId: Joi.number().integer().optional().allow(null).messages({
    'number.base': '员工ID必须是数字',
    'number.integer': '员工ID必须是整数',
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'Refresh Token不能为空',
    'any.required': 'Refresh Token是必填项',
  }),
});
