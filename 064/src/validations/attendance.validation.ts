import Joi from 'joi';
import { AttendanceStatus } from '../types';

export const bulkCreateAttendanceSchema = Joi.object({
  lessonId: Joi.number().integer().positive().required().messages({
    'number.base': '课时ID必须是数字',
    'number.positive': '课时ID必须是正数',
    'any.required': '课时ID是必填项'
  }),
  records: Joi.array().items(
    Joi.object({
      studentId: Joi.number().integer().positive().required().messages({
        'any.required': '学员ID是必填项'
      }),
      status: Joi.string().valid(...Object.values(AttendanceStatus)).default(AttendanceStatus.PRESENT),
      remark: Joi.string().allow(null, '').max(500)
    })
  ).min(1).required().messages({
    'array.min': '考勤记录不能为空',
    'any.required': '考勤记录是必填项'
  })
});

export const updateAttendanceSchema = Joi.object({
  status: Joi.string().valid(...Object.values(AttendanceStatus)).messages({
    'any.only': '考勤状态不正确'
  }),
  checkInTime: Joi.date().allow(null),
  checkOutTime: Joi.date().allow(null).greater(Joi.ref('checkInTime')).messages({
    'date.greater': '签退时间必须晚于签到时间'
  }),
  leaveReason: Joi.string().allow(null, '').max(500),
  remark: Joi.string().allow(null, '').max(500)
});

export const checkInSchema = Joi.object({
  lessonId: Joi.number().integer().positive().required().messages({
    'any.required': '课时ID是必填项'
  }),
  studentId: Joi.number().integer().positive().required().messages({
    'any.required': '学员ID是必填项'
  })
});

export const getStatisticsSchema = Joi.object({
  classId: Joi.number().integer().allow(null),
  studentId: Joi.number().integer().allow(null),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null).greater(Joi.ref('startDate'))
});
