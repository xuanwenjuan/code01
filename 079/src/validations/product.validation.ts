import Joi from 'joi'

export const createProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).required().messages({
    'string.base': '商品名称必须是字符串',
    'string.empty': '商品名称不能为空',
    'string.min': '商品名称至少1个字符',
    'string.max': '商品名称最多200个字符',
    'any.required': '商品名称是必填项'
  }),
  code: Joi.string().min(1).max(50).required().messages({
    'string.base': '商品编码必须是字符串',
    'string.empty': '商品编码不能为空',
    'string.min': '商品编码至少1个字符',
    'string.max': '商品编码最多50个字符',
    'any.required': '商品编码是必填项'
  }),
  categoryId: Joi.number().integer().positive().required().messages({
    'number.base': '类目ID必须是数字',
    'number.integer': '类目ID必须是整数',
    'number.positive': '类目ID必须是正整数',
    'any.required': '类目ID是必填项'
  }),
  brandId: Joi.number().integer().positive().required().messages({
    'number.base': '品牌ID必须是数字',
    'number.integer': '品牌ID必须是整数',
    'number.positive': '品牌ID必须是正整数',
    'any.required': '品牌ID是必填项'
  }),
  supplierId: Joi.number().integer().positive().required().messages({
    'number.base': '供货商ID必须是数字',
    'number.integer': '供货商ID必须是整数',
    'number.positive': '供货商ID必须是正整数',
    'any.required': '供货商ID是必填项'
  }),
  specification: Joi.string().max(200).allow(null, '').messages({
    'string.base': '规格必须是字符串',
    'string.max': '规格最多200个字符'
  }),
  unit: Joi.string().min(1).max(20).default('件').messages({
    'string.base': '单位必须是字符串',
    'string.min': '单位至少1个字符',
    'string.max': '单位最多20个字符'
  }),
  purchasePrice: Joi.number().precision(2).min(0).required().messages({
    'number.base': '进货价必须是数字',
    'number.min': '进货价不能小于0',
    'number.precision': '进货价最多保留2位小数',
    'any.required': '进货价是必填项'
  }),
  wholesalePrice: Joi.number().precision(2).min(0).required().messages({
    'number.base': '批发价必须是数字',
    'number.min': '批发价不能小于0',
    'number.precision': '批发价最多保留2位小数',
    'any.required': '批发价是必填项'
  }),
  retailPrice: Joi.number().precision(2).min(0).allow(null).messages({
    'number.base': '零售价必须是数字',
    'number.min': '零售价不能小于0',
    'number.precision': '零售价最多保留2位小数'
  }),
  stock: Joi.number().integer().min(0).default(0).messages({
    'number.base': '库存必须是数字',
    'number.integer': '库存必须是整数',
    'number.min': '库存不能小于0'
  }),
  minOrderQuantity: Joi.number().integer().min(1).default(1).messages({
    'number.base': '起订量必须是数字',
    'number.integer': '起订量必须是整数',
    'number.min': '起订量不能小于1'
  }),
  image: Joi.string().max(500).allow(null, '').messages({
    'string.base': '主图必须是字符串',
    'string.max': '主图路径最多500个字符'
  }),
  images: Joi.string().allow(null, '').messages({
    'string.base': '图片列表必须是字符串'
  }),
  description: Joi.string().allow(null, '').messages({
    'string.base': '商品描述必须是字符串'
  }),
  isHot: Joi.boolean().default(false).messages({
    'boolean.base': '热销标识必须是布尔值'
  }),
  isNew: Joi.boolean().default(false).messages({
    'boolean.base': '新品标识必须是布尔值'
  }),
  status: Joi.boolean().default(true).messages({
    'boolean.base': '状态必须是布尔值'
  }),
  sortOrder: Joi.number().integer().min(0).default(0).messages({
    'number.base': '排序值必须是数字',
    'number.integer': '排序值必须是整数',
    'number.min': '排序值不能小于0'
  })
})

export const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional().messages({
    'string.base': '商品名称必须是字符串',
    'string.min': '商品名称至少1个字符',
    'string.max': '商品名称最多200个字符'
  }),
  code: Joi.string().min(1).max(50).optional().messages({
    'string.base': '商品编码必须是字符串',
    'string.min': '商品编码至少1个字符',
    'string.max': '商品编码最多50个字符'
  }),
  categoryId: Joi.number().integer().positive().optional().messages({
    'number.base': '类目ID必须是数字',
    'number.integer': '类目ID必须是整数',
    'number.positive': '类目ID必须是正整数'
  }),
  brandId: Joi.number().integer().positive().optional().messages({
    'number.base': '品牌ID必须是数字',
    'number.integer': '品牌ID必须是整数',
    'number.positive': '品牌ID必须是正整数'
  }),
  supplierId: Joi.number().integer().positive().optional().messages({
    'number.base': '供货商ID必须是数字',
    'number.integer': '供货商ID必须是整数',
    'number.positive': '供货商ID必须是正整数'
  }),
  specification: Joi.string().max(200).allow(null, '').optional().messages({
    'string.base': '规格必须是字符串',
    'string.max': '规格最多200个字符'
  }),
  unit: Joi.string().min(1).max(20).optional().messages({
    'string.base': '单位必须是字符串',
    'string.min': '单位至少1个字符',
    'string.max': '单位最多20个字符'
  }),
  purchasePrice: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '进货价必须是数字',
    'number.min': '进货价不能小于0',
    'number.precision': '进货价最多保留2位小数'
  }),
  wholesalePrice: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '批发价必须是数字',
    'number.min': '批发价不能小于0',
    'number.precision': '批发价最多保留2位小数'
  }),
  retailPrice: Joi.number().precision(2).min(0).allow(null).optional().messages({
    'number.base': '零售价必须是数字',
    'number.min': '零售价不能小于0',
    'number.precision': '零售价最多保留2位小数'
  }),
  stock: Joi.number().integer().min(0).optional().messages({
    'number.base': '库存必须是数字',
    'number.integer': '库存必须是整数',
    'number.min': '库存不能小于0'
  }),
  minOrderQuantity: Joi.number().integer().min(1).optional().messages({
    'number.base': '起订量必须是数字',
    'number.integer': '起订量必须是整数',
    'number.min': '起订量不能小于1'
  }),
  image: Joi.string().max(500).allow(null, '').optional().messages({
    'string.base': '主图必须是字符串',
    'string.max': '主图路径最多500个字符'
  }),
  images: Joi.string().allow(null, '').optional().messages({
    'string.base': '图片列表必须是字符串'
  }),
  description: Joi.string().allow(null, '').optional().messages({
    'string.base': '商品描述必须是字符串'
  }),
  isHot: Joi.boolean().optional().messages({
    'boolean.base': '热销标识必须是布尔值'
  }),
  isNew: Joi.boolean().optional().messages({
    'boolean.base': '新品标识必须是布尔值'
  }),
  status: Joi.boolean().optional().messages({
    'boolean.base': '状态必须是布尔值'
  }),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    'number.base': '排序值必须是数字',
    'number.integer': '排序值必须是整数',
    'number.min': '排序值不能小于0'
  })
})

export const updateStockSchema = Joi.object({
  stock: Joi.number().integer().min(0).required().messages({
    'number.base': '库存必须是数字',
    'number.integer': '库存必须是整数',
    'number.min': '库存不能小于0',
    'any.required': '库存是必填项'
  })
})

export const productIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '商品ID必须是数字',
    'number.integer': '商品ID必须是整数',
    'number.positive': '商品ID必须是正整数',
    'any.required': '商品ID是必填项'
  })
})
