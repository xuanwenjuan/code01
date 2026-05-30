import Joi from 'joi';

export const loginSchema = Joi.object({
  username: Joi.string().min(1).max(50).required().messages({
    'string.empty': '用户名不能为空',
    'any.required': '用户名是必填项'
  }),
  password: Joi.string().min(1).max(50).required().messages({
    'string.empty': '密码不能为空',
    'any.required': '密码是必填项'
  })
});
