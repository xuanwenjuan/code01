import Joi from 'joi';

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': '用户名不能为空',
    'any.required': '用户名是必填项'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': '密码不能为空',
    'string.min': '密码长度不能少于6位',
    'any.required': '密码是必填项'
  })
});

export const registerSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': '用户名不能为空',
    'any.required': '用户名是必填项'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': '密码不能为空',
    'string.min': '密码长度不能少于6位',
    'any.required': '密码是必填项'
  }),
  realName: Joi.string().required().messages({
    'string.empty': '真实姓名不能为空',
    'any.required': '真实姓名是必填项'
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.empty': '手机号不能为空',
    'string.pattern.base': '手机号格式不正确',
    'any.required': '手机号是必填项'
  }),
  email: Joi.string().email().allow(null, '').messages({
    'string.email': '邮箱格式不正确'
  })
});
