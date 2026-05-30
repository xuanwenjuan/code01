import Joi from 'joi'
import { CategoryType, Season } from '../types'

export const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.base': '类目名称必须是字符串',
    'string.empty': '类目名称不能为空',
    'string.min': '类目名称至少1个字符',
    'string.max': '类目名称最多100个字符',
    'any.required': '类目名称是必填项'
  }),
  type: Joi.string().valid(...Object.values(CategoryType)).required().messages({
    'string.base': '类目类型必须是字符串',
    'any.only': `类目类型必须是: ${Object.values(CategoryType).join(', ')}`,
    'any.required': '类目类型是必填项'
  }),
  parentId: Joi.number().integer().allow(null).messages({
    'number.base': '父类目ID必须是数字',
    'number.integer': '父类目ID必须是整数'
  }),
  sortOrder: Joi.number().integer().min(0).default(0).messages({
    'number.base': '排序值必须是数字',
    'number.integer': '排序值必须是整数',
    'number.min': '排序值不能小于0'
  }),
  icon: Joi.string().max(500).allow(null, '').messages({
    'string.base': '图标必须是字符串',
    'string.max': '图标路径最多500个字符'
  }),
  description: Joi.string().allow(null, '').messages({
    'string.base': '描述必须是字符串'
  }),
  season: Joi.string().valid(...Object.values(Season)).default(Season.ALL).messages({
    'string.base': '季节必须是字符串',
    'any.only': `季节必须是: ${Object.values(Season).join(', ')}`
  }),
  isActive: Joi.boolean().default(true).messages({
    'boolean.base': '状态必须是布尔值'
  })
})

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.base': '类目名称必须是字符串',
    'string.empty': '类目名称不能为空',
    'string.min': '类目名称至少1个字符',
    'string.max': '类目名称最多100个字符'
  }),
  type: Joi.string().valid(...Object.values(CategoryType)).optional().messages({
    'string.base': '类目类型必须是字符串',
    'any.only': `类目类型必须是: ${Object.values(CategoryType).join(', ')}`
  }),
  parentId: Joi.number().integer().allow(null).optional().messages({
    'number.base': '父类目ID必须是数字',
    'number.integer': '父类目ID必须是整数'
  }),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    'number.base': '排序值必须是数字',
    'number.integer': '排序值必须是整数',
    'number.min': '排序值不能小于0'
  }),
  icon: Joi.string().max(500).allow(null, '').optional().messages({
    'string.base': '图标必须是字符串',
    'string.max': '图标路径最多500个字符'
  }),
  description: Joi.string().allow(null, '').optional().messages({
    'string.base': '描述必须是字符串'
  }),
  season: Joi.string().valid(...Object.values(Season)).optional().messages({
    'string.base': '季节必须是字符串',
    'any.only': `季节必须是: ${Object.values(Season).join(', ')}`
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': '状态必须是布尔值'
  })
})

export const categoryIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '类目ID必须是数字',
    'number.integer': '类目ID必须是整数',
    'number.positive': '类目ID必须是正整数',
    'any.required': '类目ID是必填项'
  })
})
