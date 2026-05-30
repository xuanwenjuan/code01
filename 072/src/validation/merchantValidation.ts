import Joi from 'joi';

export const createMerchantSchema = Joi.object({
  name: Joi.string().min(1).max(200).required().messages({
    'string.empty': '商家名称不能为空',
    'string.max': '商家名称不能超过200个字符',
    'any.required': '商家名称是必填项'
  }),
  contactPerson: Joi.string().min(1).max(50).required().messages({
    'string.empty': '联系人不能为空',
    'string.max': '联系人不能超过50个字符',
    'any.required': '联系人是必填项'
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '请输入有效的手机号码',
    'any.required': '联系电话是必填项'
  }),
  email: Joi.string().email().allow('').optional().messages({
    'string.email': '请输入有效的邮箱地址'
  }),
  address: Joi.string().max(500).allow('').optional(),
  businessLicense: Joi.string().allow('').optional(),
  serviceItems: Joi.string().allow('').optional(),
  cooperationStartDate: Joi.date().optional(),
  cooperationEndDate: Joi.date().optional()
});

export const updateMerchantSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  contactPerson: Joi.string().min(1).max(50).optional(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
    'string.pattern.base': '请输入有效的手机号码'
  }),
  email: Joi.string().email().allow('').optional().messages({
    'string.email': '请输入有效的邮箱地址'
  }),
  address: Joi.string().max(500).allow('').optional(),
  businessLicense: Joi.string().allow('').optional(),
  serviceItems: Joi.string().allow('').optional(),
  cooperationStartDate: Joi.date().optional(),
  cooperationEndDate: Joi.date().optional(),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'suspended').optional()
});

export const auditMerchantSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected', 'suspended').required().messages({
    'any.required': '审核状态是必填项',
    'any.only': '无效的审核状态'
  }),
  auditRemark: Joi.string().max(500).optional().messages({
    'string.max': '审核备注不能超过500个字符'
  })
});

export const createScheduleSchema = Joi.object({
  merchantId: Joi.number().integer().required().messages({
    'any.required': '商家ID是必填项'
  }),
  date: Joi.date().required().messages({
    'any.required': '日期是必填项'
  }),
  timeSlot: Joi.string().min(1).max(50).required().messages({
    'any.required': '时间段是必填项'
  })
});

export const toggleScheduleLockSchema = Joi.object({
  isLocked: Joi.boolean().required().messages({
    'any.required': '锁定状态是必填项'
  })
});

export const createPricePackageSchema = Joi.object({
  merchantId: Joi.number().integer().required().messages({
    'any.required': '商家ID是必填项'
  }),
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': '套餐名称不能为空',
    'any.required': '套餐名称是必填项'
  }),
  description: Joi.string().max(500).optional(),
  basePrice: Joi.number().min(0).default(0),
  pricePerPerson: Joi.number().min(0).default(0),
  minParticipants: Joi.number().integer().min(1).default(1),
  maxParticipants: Joi.number().integer().min(1).optional(),
  includedServices: Joi.string().optional(),
  status: Joi.number().integer().valid(0, 1).default(1)
});
