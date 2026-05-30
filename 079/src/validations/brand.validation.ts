import Joi from 'joi'

export const createBrandSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.base': '品牌名称必须是字符串',
    'string.empty': '品牌名称不能为空',
    'string.min': '品牌名称至少1个字符',
    'string.max': '品牌名称最多100个字符',
    'any.required': '品牌名称是必填项'
  }),
  supplierId: Joi.number().integer().positive().required().messages({
    'number.base': '供货商ID必须是数字',
    'number.integer': '供货商ID必须是整数',
    'number.positive': '供货商ID必须是正整数',
    'any.required': '供货商ID是必填项'
  }),
  logo: Joi.string().max(500).allow(null, '').messages({
    'string.base': 'Logo必须是字符串',
    'string.max': 'Logo路径最多500个字符'
  }),
  description: Joi.string().allow(null, '').messages({
    'string.base': '描述必须是字符串'
  }),
  origin: Joi.string().max(100).allow(null, '').messages({
    'string.base': '产地必须是字符串',
    'string.max': '产地最多100个字符'
  }),
  authorizationLevel: Joi.string().max(50).allow(null, '').messages({
    'string.base': '授权等级必须是字符串',
    'string.max': '授权等级最多50个字符'
  }),
  authorizationStartDate: Joi.date().allow(null).messages({
    'date.base': '授权开始日期格式不正确'
  }),
  authorizationEndDate: Joi.date().allow(null).greater(Joi.ref('authorizationStartDate')).messages({
    'date.base': '授权结束日期格式不正确',
    'date.greater': '授权结束日期必须晚于开始日期'
  }),
  sortOrder: Joi.number().integer().min(0).default(0).messages({
    'number.base': '排序值必须是数字',
    'number.integer': '排序值必须是整数',
    'number.min': '排序值不能小于0'
  }),
  status: Joi.boolean().default(true).messages({
    'boolean.base': '状态必须是布尔值'
  })
})

export const updateBrandSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.base': '品牌名称必须是字符串',
    'string.min': '品牌名称至少1个字符',
    'string.max': '品牌名称最多100个字符'
  }),
  supplierId: Joi.number().integer().positive().optional().messages({
    'number.base': '供货商ID必须是数字',
    'number.integer': '供货商ID必须是整数',
    'number.positive': '供货商ID必须是正整数'
  }),
  logo: Joi.string().max(500).allow(null, '').optional().messages({
    'string.base': 'Logo必须是字符串',
    'string.max': 'Logo路径最多500个字符'
  }),
  description: Joi.string().allow(null, '').optional().messages({
    'string.base': '描述必须是字符串'
  }),
  origin: Joi.string().max(100).allow(null, '').optional().messages({
    'string.base': '产地必须是字符串',
    'string.max': '产地最多100个字符'
  }),
  authorizationLevel: Joi.string().max(50).allow(null, '').optional().messages({
    'string.base': '授权等级必须是字符串',
    'string.max': '授权等级最多50个字符'
  }),
  authorizationStartDate: Joi.date().allow(null).optional().messages({
    'date.base': '授权开始日期格式不正确'
  }),
  authorizationEndDate: Joi.date().allow(null).optional().messages({
    'date.base': '授权结束日期格式不正确'
  }),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    'number.base': '排序值必须是数字',
    'number.integer': '排序值必须是整数',
    'number.min': '排序值不能小于0'
  }),
  status: Joi.boolean().optional().messages({
    'boolean.base': '状态必须是布尔值'
  })
})

export const brandIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '品牌ID必须是数字',
    'number.integer': '品牌ID必须是整数',
    'number.positive': '品牌ID必须是正整数',
    'any.required': '品牌ID是必填项'
  })
})
