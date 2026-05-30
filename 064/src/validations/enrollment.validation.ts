import Joi from 'joi';
import { EnrollmentStatus, PaymentStatus } from '../types';

export const createEnrollmentSchema = Joi.object({
  studentId: Joi.number().integer().positive().required().messages({
    'number.base': '学员ID必须是数字',
    'number.positive': '学员ID必须是正数',
    'any.required': '学员ID是必填项'
  }),
  majorId: Joi.number().integer().positive().required().messages({
    'number.base': '专业ID必须是数字',
    'number.positive': '专业ID必须是正数',
    'any.required': '专业ID是必填项'
  }),
  amount: Joi.number().precision(2).min(0).default(0).messages({
    'number.base': '金额必须是数字',
    'number.min': '金额不能为负数'
  }),
  remark: Joi.string().allow(null, '').max(500).messages({
    'string.max': '备注不能超过500个字符'
  })
});

export const approveEnrollmentSchema = Joi.object({
  remark: Joi.string().allow(null, '').max(500).messages({
    'string.max': '备注不能超过500个字符'
  })
});

export const rejectEnrollmentSchema = Joi.object({
  remark: Joi.string().required().max(500).messages({
    'string.empty': '拒绝原因不能为空',
    'string.max': '拒绝原因不能超过500个字符',
    'any.required': '拒绝原因是必填项'
  })
});

export const assignClassSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '报名ID必须是数字',
    'number.positive': '报名ID必须是正数',
    'any.required': '报名ID是必填项'
  }),
  classId: Joi.number().integer().positive().required().messages({
    'number.base': '班级ID必须是数字',
    'number.positive': '班级ID必须是正数',
    'any.required': '班级ID是必填项'
  })
});

export const getEnrollmentListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...Object.values(EnrollmentStatus)).allow(null, ''),
  paymentStatus: Joi.string().valid(...Object.values(PaymentStatus)).allow(null, ''),
  studentId: Joi.number().integer().allow(null),
  majorId: Joi.number().integer().allow(null),
  classId: Joi.number().integer().allow(null)
});

export const updateStudentStatusSchema = Joi.object({
  status: Joi.string().required().messages({
    'any.required': '学员状态是必填项'
  })
});
