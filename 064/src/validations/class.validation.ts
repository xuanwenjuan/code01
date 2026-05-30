import Joi from 'joi';
import { ClassStatus } from '../types';

export const createClassSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'string.empty': '班级名称不能为空',
    'string.max': '班级名称不能超过100个字符',
    'any.required': '班级名称是必填项'
  }),
  majorId: Joi.number().integer().positive().required().messages({
    'number.base': '专业ID必须是数字',
    'number.positive': '专业ID必须是正数',
    'any.required': '专业是必填项'
  }),
  teacherId: Joi.number().integer().positive().required().messages({
    'number.base': '讲师ID必须是数字',
    'number.positive': '讲师ID必须是正数',
    'any.required': '讲师是必填项'
  }),
  maxStudents: Joi.number().integer().min(1).max(500).default(30).messages({
    'number.min': '最大人数不能少于1',
    'number.max': '最大人数不能超过500'
  }),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null).greater(Joi.ref('startDate')).messages({
    'date.greater': '结束日期必须晚于开始日期'
  }),
  totalHours: Joi.number().integer().min(0).default(0),
  classroom: Joi.string().allow(null, '').max(100),
  description: Joi.string().allow(null, '').max(500)
});

export const updateClassSchema = Joi.object({
  name: Joi.string().max(100),
  majorId: Joi.number().integer().positive(),
  teacherId: Joi.number().integer().positive(),
  maxStudents: Joi.number().integer().min(1).max(500),
  status: Joi.string().valid(...Object.values(ClassStatus)),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
  totalHours: Joi.number().integer().min(0),
  completedHours: Joi.number().integer().min(0),
  classroom: Joi.string().allow(null, '').max(100),
  description: Joi.string().allow(null, '').max(500)
});

export const getClassListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...Object.values(ClassStatus)).allow(null, ''),
  majorId: Joi.number().integer().allow(null),
  teacherId: Joi.number().integer().allow(null),
  keyword: Joi.string().allow(null, '')
});

export const updateClassStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ClassStatus)).required().messages({
    'any.only': '状态值不正确',
    'any.required': '状态是必填项'
  })
});
