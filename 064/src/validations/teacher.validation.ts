import Joi from 'joi';
import { TeacherStatus, TeacherType } from '../types';

export const createTeacherSchema = Joi.object({
  name: Joi.string().required().max(50).messages({
    'string.empty': '讲师姓名不能为空',
    'string.max': '讲师姓名不能超过50个字符',
    'any.required': '讲师姓名是必填项'
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.empty': '手机号不能为空',
    'string.pattern.base': '手机号格式不正确',
    'any.required': '手机号是必填项'
  }),
  idCard: Joi.string().pattern(/^\d{17}[\dXx]$/).allow(null, '').messages({
    'string.pattern.base': '身份证号格式不正确'
  }),
  type: Joi.string().valid(...Object.values(TeacherType)).default(TeacherType.FULL_TIME),
  teachingMajorIds: Joi.string().allow(null, ''),
  qualifications: Joi.string().allow(null, '').max(500).messages({
    'string.max': '教学资质描述不能超过500个字符'
  }),
  experience: Joi.string().allow(null, '').max(1000).messages({
    'string.max': '教学经验描述不能超过1000个字符'
  }),
  avatar: Joi.string().uri().allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  address: Joi.string().allow(null, '').max(200),
  remark: Joi.string().allow(null, '').max(500)
});

export const updateTeacherSchema = Joi.object({
  name: Joi.string().max(50),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/),
  idCard: Joi.string().pattern(/^\d{17}[\dXx]$/).allow(null, ''),
  type: Joi.string().valid(...Object.values(TeacherType)),
  status: Joi.string().valid(...Object.values(TeacherStatus)),
  teachingMajorIds: Joi.string().allow(null, ''),
  qualifications: Joi.string().allow(null, '').max(500),
  experience: Joi.string().allow(null, '').max(1000),
  avatar: Joi.string().uri().allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  address: Joi.string().allow(null, '').max(200),
  remark: Joi.string().allow(null, '').max(500)
});

export const getTeacherListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...Object.values(TeacherStatus)).allow(null, ''),
  type: Joi.string().valid(...Object.values(TeacherType)).allow(null, ''),
  majorId: Joi.number().integer().allow(null),
  keyword: Joi.string().allow(null, '')
});

export const updateTeacherStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(TeacherStatus)).required().messages({
    'any.only': '状态值不正确',
    'any.required': '状态是必填项'
  })
});
