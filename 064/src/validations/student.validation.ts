import Joi from 'joi';
import { StudentStatus } from '../types';

export const createStudentSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': '学员姓名不能为空',
    'any.required': '学员姓名是必填项'
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.empty': '手机号不能为空',
    'string.pattern.base': '手机号格式不正确',
    'any.required': '手机号是必填项'
  }),
  idCard: Joi.string().allow(null, ''),
  gender: Joi.string().valid('male', 'female').allow(null, ''),
  birthday: Joi.date().allow(null),
  status: Joi.string().valid(...Object.values(StudentStatus)).default(StudentStatus.REGISTERED),
  avatar: Joi.string().allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  address: Joi.string().allow(null, ''),
  education: Joi.string().allow(null, ''),
  remark: Joi.string().allow(null, '')
});

export const updateStudentSchema = Joi.object({
  name: Joi.string(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/),
  idCard: Joi.string().allow(null, ''),
  gender: Joi.string().valid('male', 'female').allow(null, ''),
  birthday: Joi.date().allow(null),
  status: Joi.string().valid(...Object.values(StudentStatus)),
  avatar: Joi.string().allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  address: Joi.string().allow(null, ''),
  education: Joi.string().allow(null, ''),
  remark: Joi.string().allow(null, '')
});
