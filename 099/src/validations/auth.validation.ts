import Joi from 'joi';

export const loginSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': '用户名不能为空',
      'any.required': '用户名是必填项'
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': '密码不能为空',
      'string.min': '密码长度不能少于6个字符',
      'any.required': '密码是必填项'
    })
  })
});

export const registerSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': '用户名不能为空',
      'any.required': '用户名是必填项'
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': '密码不能为空',
      'string.min': '密码长度不能少于6个字符',
      'any.required': '密码是必填项'
    }),
    realName: Joi.string().required().messages({
      'string.empty': '真实姓名不能为空',
      'any.required': '真实姓名是必填项'
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
      'string.pattern.base': '手机号格式不正确'
    }),
    role: Joi.string().valid('admin', 'trainer', 'warehouse', 'purchaser').required().messages({
      'any.only': '角色必须是 admin、trainer、warehouse 或 purchaser',
      'any.required': '角色是必填项'
    })
  })
});

export const updateUserSchema = Joi.object({
  body: Joi.object({
    realName: Joi.string().optional(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
      'string.pattern.base': '手机号格式不正确'
    }),
    status: Joi.string().valid('active', 'inactive').optional()
  }),
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  })
});
