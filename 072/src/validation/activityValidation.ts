import Joi from 'joi';

export const createActivitySchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': '活动标题不能为空',
    'string.max': '活动标题不能超过200个字符',
    'any.required': '活动标题是必填项'
  }),
  description: Joi.string().allow('').optional(),
  categoryId: Joi.number().integer().required().messages({
    'any.required': '活动类目是必填项'
  }),
  merchantId: Joi.number().integer().required().messages({
    'any.required': '合作商家是必填项'
  }),
  pricePackageId: Joi.number().integer().required().messages({
    'any.required': '报价套餐是必填项'
  }),
  maxParticipants: Joi.number().integer().min(1).required().messages({
    'number.min': '活动人数至少为1人',
    'any.required': '活动人数限制是必填项'
  }),
  registrationStartTime: Joi.date().required().messages({
    'any.required': '报名开始时间是必填项'
  }),
  registrationEndTime: Joi.date().greater(Joi.ref('registrationStartTime')).required().messages({
    'date.greater': '报名结束时间必须晚于开始时间',
    'any.required': '报名结束时间是必填项'
  }),
  activityStartTime: Joi.date().required().messages({
    'any.required': '活动开始时间是必填项'
  }),
  activityEndTime: Joi.date().greater(Joi.ref('activityStartTime')).required().messages({
    'date.greater': '活动结束时间必须晚于开始时间',
    'any.required': '活动结束时间是必填项'
  }),
  location: Joi.string().min(1).max(500).required().messages({
    'string.empty': '活动地点不能为空',
    'any.required': '活动地点是必填项'
  }),
  fee: Joi.number().min(0).default(0),
  allowedDepartments: Joi.array().items(Joi.number().integer()).optional()
});

export const updateActivitySchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().allow('').optional(),
  categoryId: Joi.number().integer().optional(),
  merchantId: Joi.number().integer().optional(),
  pricePackageId: Joi.number().integer().optional(),
  maxParticipants: Joi.number().integer().min(1).optional().messages({
    'number.min': '活动人数至少为1人'
  }),
  registrationStartTime: Joi.date().optional(),
  registrationEndTime: Joi.date().optional(),
  activityStartTime: Joi.date().optional(),
  activityEndTime: Joi.date().optional(),
  location: Joi.string().min(1).max(500).optional(),
  fee: Joi.number().min(0).optional(),
  allowedDepartments: Joi.array().items(Joi.number().integer()).optional(),
  status: Joi.string().valid('draft', 'registering', 'closed', 'completed').optional()
});

export const updateActivityStatusSchema = Joi.object({
  status: Joi.string().valid('draft', 'registering', 'closed', 'completed').required().messages({
    'any.required': '活动状态是必填项',
    'any.only': '无效的活动状态'
  })
});

export const registerActivitySchema = Joi.object({
  activityId: Joi.number().integer().required().messages({
    'any.required': '活动ID是必填项'
  })
});

export const approveRegistrationSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required().messages({
    'any.required': '审批状态是必填项',
    'any.only': '无效的审批状态'
  }),
  remark: Joi.string().max(500).optional()
});

export const cancelRegistrationSchema = Joi.object({
  reason: Joi.string().max(500).optional()
});
