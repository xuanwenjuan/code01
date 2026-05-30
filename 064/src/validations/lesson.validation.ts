import Joi from 'joi';

export const createLessonSchema = Joi.object({
  classId: Joi.number().integer().positive().required().messages({
    'number.base': '班级ID必须是数字',
    'number.positive': '班级ID必须是正数',
    'any.required': '班级ID是必填项'
  }),
  teacherId: Joi.number().integer().positive().required().messages({
    'number.base': '讲师ID必须是数字',
    'number.positive': '讲师ID必须是正数',
    'any.required': '讲师ID是必填项'
  }),
  title: Joi.string().required().max(200).messages({
    'string.empty': '课时标题不能为空',
    'string.max': '课时标题不能超过200个字符',
    'any.required': '课时标题是必填项'
  }),
  content: Joi.string().allow(null, '').max(1000).messages({
    'string.max': '课程内容不能超过1000个字符'
  }),
  lessonDate: Joi.date().required().messages({
    'any.required': '上课日期是必填项'
  }),
  startTime: Joi.string().required().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
    'string.empty': '开始时间不能为空',
    'string.pattern.base': '开始时间格式错误，应为 HH:mm',
    'any.required': '开始时间是必填项'
  }),
  endTime: Joi.string().required().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
    'string.empty': '结束时间不能为空',
    'string.pattern.base': '结束时间格式错误，应为 HH:mm',
    'any.required': '结束时间是必填项'
  }),
  duration: Joi.number().integer().min(0).default(1).messages({
    'number.min': '课时数不能为负数'
  }),
  classroom: Joi.string().allow(null, '').max(100),
  remark: Joi.string().allow(null, '').max(500)
});

export const updateLessonSchema = Joi.object({
  title: Joi.string().max(200),
  content: Joi.string().allow(null, '').max(1000),
  lessonDate: Joi.date(),
  startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  duration: Joi.number().integer().min(0),
  classroom: Joi.string().allow(null, '').max(100),
  isCompleted: Joi.boolean(),
  remark: Joi.string().allow(null, '').max(500)
});

export const getLessonListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  classId: Joi.number().integer().allow(null),
  teacherId: Joi.number().integer().allow(null),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null).greater(Joi.ref('startDate')),
  isCompleted: Joi.boolean().allow(null)
});
