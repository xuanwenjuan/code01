import Joi from 'joi'

export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.base': '用户名必须是字符串',
    'string.empty': '用户名不能为空',
    'string.min': '用户名至少3个字符',
    'string.max': '用户名最多50个字符',
    'any.required': '用户名是必填项'
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.base': '密码必须是字符串',
    'string.empty': '密码不能为空',
    'string.min': '密码至少6个字符',
    'string.max': '密码最多100个字符',
    'any.required': '密码是必填项'
  })
})

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.base': '用户名必须是字符串',
    'string.empty': '用户名不能为空',
    'string.min': '用户名至少3个字符',
    'string.max': '用户名最多50个字符',
    'any.required': '用户名是必填项'
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.base': '密码必须是字符串',
    'string.empty': '密码不能为空',
    'string.min': '密码至少6个字符',
    'string.max': '密码最多100个字符',
    'any.required': '密码是必填项'
  }),
  realName: Joi.string().min(2).max(50).required().messages({
    'string.base': '真实姓名必须是字符串',
    'string.empty': '真实姓名不能为空',
    'string.min': '真实姓名至少2个字符',
    'string.max': '真实姓名最多50个字符',
    'any.required': '真实姓名是必填项'
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.base': '手机号必须是字符串',
    'string.empty': '手机号不能为空',
    'string.pattern.base': '手机号格式不正确',
    'any.required': '手机号是必填项'
  }),
  email: Joi.string().email().allow(null, '').messages({
    'string.base': '邮箱必须是字符串',
    'string.email': '邮箱格式不正确'
  }),
  companyName: Joi.string().min(2).max(200).allow(null, '').messages({
    'string.base': '公司名称必须是字符串',
    'string.min': '公司名称至少2个字符',
    'string.max': '公司名称最多200个字符'
  })
})

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).max(100).required().messages({
    'string.base': '旧密码必须是字符串',
    'string.empty': '旧密码不能为空',
    'string.min': '旧密码至少6个字符',
    'string.max': '旧密码最多100个字符',
    'any.required': '旧密码是必填项'
  }),
  newPassword: Joi.string().min(6).max(100).required().messages({
    'string.base': '新密码必须是字符串',
    'string.empty': '新密码不能为空',
    'string.min': '新密码至少6个字符',
    'string.max': '新密码最多100个字符',
    'any.required': '新密码是必填项'
  })
})
