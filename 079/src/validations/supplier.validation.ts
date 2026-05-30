import Joi from 'joi'

export const createSupplierSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'string.base': '供货商名称必须是字符串',
    'string.empty': '供货商名称不能为空',
    'string.min': '供货商名称至少2个字符',
    'string.max': '供货商名称最多200个字符',
    'any.required': '供货商名称是必填项'
  }),
  contactPerson: Joi.string().min(2).max(50).required().messages({
    'string.base': '联系人必须是字符串',
    'string.empty': '联系人不能为空',
    'string.min': '联系人至少2个字符',
    'string.max': '联系人最多50个字符',
    'any.required': '联系人是必填项'
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/).required().messages({
    'string.base': '联系电话必须是字符串',
    'string.empty': '联系电话不能为空',
    'string.pattern.base': '联系电话格式不正确',
    'any.required': '联系电话是必填项'
  }),
  email: Joi.string().email().allow(null, '').messages({
    'string.base': '邮箱必须是字符串',
    'string.email': '邮箱格式不正确'
  }),
  address: Joi.string().max(500).allow(null, '').messages({
    'string.base': '地址必须是字符串',
    'string.max': '地址最多500个字符'
  }),
  licenseNumber: Joi.string().max(100).allow(null, '').messages({
    'string.base': '营业执照号必须是字符串',
    'string.max': '营业执照号最多100个字符'
  }),
  businessLicense: Joi.string().max(500).allow(null, '').messages({
    'string.base': '营业执照图片必须是字符串',
    'string.max': '营业执照图片路径最多500个字符'
  }),
  authorizationCert: Joi.string().max(500).allow(null, '').messages({
    'string.base': '授权证书必须是字符串',
    'string.max': '授权证书路径最多500个字符'
  }),
  cooperationStartDate: Joi.date().allow(null).messages({
    'date.base': '合作开始日期格式不正确'
  }),
  cooperationEndDate: Joi.date().allow(null).greater(Joi.ref('cooperationStartDate')).messages({
    'date.base': '合作结束日期格式不正确',
    'date.greater': '合作结束日期必须晚于开始日期'
  }),
  minOrderAmount: Joi.number().min(0).default(0).messages({
    'number.base': '起订金额必须是数字',
    'number.min': '起订金额不能小于0'
  }),
  rating: Joi.number().min(0).max(5).default(5).messages({
    'number.base': '评分必须是数字',
    'number.min': '评分不能小于0',
    'number.max': '评分不能大于5'
  }),
  status: Joi.boolean().default(true).messages({
    'boolean.base': '状态必须是布尔值'
  }),
  remarks: Joi.string().allow(null, '').messages({
    'string.base': '备注必须是字符串'
  })
})

export const updateSupplierSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional().messages({
    'string.base': '供货商名称必须是字符串',
    'string.min': '供货商名称至少2个字符',
    'string.max': '供货商名称最多200个字符'
  }),
  contactPerson: Joi.string().min(2).max(50).optional().messages({
    'string.base': '联系人必须是字符串',
    'string.min': '联系人至少2个字符',
    'string.max': '联系人最多50个字符'
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/).optional().messages({
    'string.base': '联系电话必须是字符串',
    'string.pattern.base': '联系电话格式不正确'
  }),
  email: Joi.string().email().allow(null, '').optional().messages({
    'string.base': '邮箱必须是字符串',
    'string.email': '邮箱格式不正确'
  }),
  address: Joi.string().max(500).allow(null, '').optional().messages({
    'string.base': '地址必须是字符串',
    'string.max': '地址最多500个字符'
  }),
  licenseNumber: Joi.string().max(100).allow(null, '').optional().messages({
    'string.base': '营业执照号必须是字符串',
    'string.max': '营业执照号最多100个字符'
  }),
  businessLicense: Joi.string().max(500).allow(null, '').optional().messages({
    'string.base': '营业执照图片必须是字符串',
    'string.max': '营业执照图片路径最多500个字符'
  }),
  authorizationCert: Joi.string().max(500).allow(null, '').optional().messages({
    'string.base': '授权证书必须是字符串',
    'string.max': '授权证书路径最多500个字符'
  }),
  cooperationStartDate: Joi.date().allow(null).optional().messages({
    'date.base': '合作开始日期格式不正确'
  }),
  cooperationEndDate: Joi.date().allow(null).optional().messages({
    'date.base': '合作结束日期格式不正确'
  }),
  minOrderAmount: Joi.number().min(0).optional().messages({
    'number.base': '起订金额必须是数字',
    'number.min': '起订金额不能小于0'
  }),
  rating: Joi.number().min(0).max(5).optional().messages({
    'number.base': '评分必须是数字',
    'number.min': '评分不能小于0',
    'number.max': '评分不能大于5'
  }),
  status: Joi.boolean().optional().messages({
    'boolean.base': '状态必须是布尔值'
  }),
  remarks: Joi.string().allow(null, '').optional().messages({
    'string.base': '备注必须是字符串'
  })
})

export const supplierIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '供货商ID必须是数字',
    'number.integer': '供货商ID必须是整数',
    'number.positive': '供货商ID必须是正整数',
    'any.required': '供货商ID是必填项'
  })
})
