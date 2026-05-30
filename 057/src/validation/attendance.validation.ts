import Joi from 'joi';

export const clockInSchema = Joi.object({
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  location: Joi.string().optional(),
  device: Joi.string().optional(),
  ip: Joi.string().optional(),
});

export const clockOutSchema = Joi.object({
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  location: Joi.string().optional(),
  device: Joi.string().optional(),
  ip: Joi.string().optional(),
});

export const leaveRequestSchema = Joi.object({
  type: Joi.string().valid('annual', 'sick', 'personal', 'marriage', 'maternity', 'paternity', 'other').required().messages({
    'any.only': '请假类型不正确',
    'any.required': '请假类型是必填项',
  }),
  startDate: Joi.date().required().messages({
    'any.required': '开始日期是必填项',
  }),
  endDate: Joi.date().required().messages({
    'any.required': '结束日期是必填项',
  }),
  days: Joi.number().positive().required().messages({
    'number.base': '天数必须是数字',
    'number.positive': '天数必须大于0',
    'any.required': '天数是必填项',
  }),
  reason: Joi.string().required().messages({
    'string.empty': '请假原因不能为空',
    'any.required': '请假原因是必填项',
  }),
});

export const approveLeaveSchema = Joi.object({
  approvalRemark: Joi.string().optional(),
});

export const makeupCardSchema = Joi.object({
  attendanceDate: Joi.date().required().messages({
    'any.required': '考勤日期是必填项',
  }),
  type: Joi.string().valid('clock_in', 'clock_out').required().messages({
    'any.only': '补卡类型必须是 clock_in 或 clock_out',
    'any.required': '补卡类型是必填项',
  }),
  makeupTime: Joi.date().required().messages({
    'any.required': '补卡时间是必填项',
  }),
  reason: Joi.string().required().messages({
    'string.empty': '补卡原因不能为空',
    'any.required': '补卡原因是必填项',
  }),
});

export const approveMakeupCardSchema = Joi.object({
  approvalRemark: Joi.string().optional(),
});
