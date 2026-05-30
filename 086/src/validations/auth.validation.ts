import Joi from 'joi';
import { UserRole } from '../types';

export const registerSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().min(3).max(50).required().messages({
      'string.min': '用户名至少3个字符',
      'string.max': '用户名最多50个字符',
      'any.required': '用户名不能为空'
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.min': '密码至少6个字符',
      'string.max': '密码最多100个字符',
      'any.required': '密码不能为空'
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
      'string.pattern.base': '请输入有效的手机号',
      'any.required': '手机号不能为空'
    }),
    role: Joi.string().valid(...Object.values(UserRole)).optional().messages({
      'any.only': '无效的用户角色'
    }),
    realName: Joi.string().max(50).optional(),
    avatar: Joi.string().uri().optional()
  })
});

export const loginSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().required().messages({
      'any.required': '用户名不能为空'
    }),
    password: Joi.string().required().messages({
      'any.required': '密码不能为空'
    })
  })
});
