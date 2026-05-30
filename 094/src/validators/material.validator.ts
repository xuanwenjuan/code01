import Joi from 'joi';

export const createMaterialSchema = Joi.object({
  code: Joi.string().required().pattern(/^[A-Z0-9-]{2,50}$/).messages({
    'string.empty': '物料编号不能为空',
    'any.required': '物料编号是必填项',
    'string.pattern.base': '物料编号只能包含大写字母、数字和横杠，长度2-50位',
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': '物料名称不能为空',
    'string.min': '物料名称长度不能少于2位',
    'string.max': '物料名称长度不能超过100位',
    'any.required': '物料名称是必填项',
  }),
  categoryId: Joi.number().integer().positive().required().messages({
    'number.base': '类目ID必须是数字',
    'number.positive': '类目ID必须是正数',
    'any.required': '类目ID是必填项',
  }),
  specification: Joi.string().max(200).optional().messages({
    'string.max': '规格长度不能超过200位',
  }),
  unit: Joi.string().required().max(20).messages({
    'string.empty': '计量单位不能为空',
    'string.max': '计量单位长度不能超过20位',
    'any.required': '计量单位是必填项',
  }),
  origin: Joi.string().max(100).optional().messages({
    'string.max': '产地长度不能超过100位',
  }),
  grade: Joi.string().max(50).optional().messages({
    'string.max': '品级长度不能超过50位',
  }),
  batchNumber: Joi.string().max(100).optional().messages({
    'string.max': '批次号长度不能超过100位',
  }),
  warehouseLocation: Joi.string().max(100).optional().messages({
    'string.max': '仓位长度不能超过100位',
  }),
  unitPrice: Joi.number().precision(2).min(0).optional().default(0).messages({
    'number.base': '单价必须是数字',
    'number.min': '单价不能为负数',
  }),
  currentStock: Joi.number().precision(4).min(0).optional().default(0).messages({
    'number.base': '当前库存必须是数字',
    'number.min': '当前库存不能为负数',
  }),
  minStock: Joi.number().precision(4).min(0).optional().default(0).messages({
    'number.base': '最低库存必须是数字',
    'number.min': '最低库存不能为负数',
  }),
  maxStock: Joi.number().precision(4).positive().optional().messages({
    'number.base': '最高库存必须是数字',
    'number.positive': '最高库存必须是正数',
  }),
  isPurchasable: Joi.boolean().optional().messages({
    'boolean.base': 'isPurchasable 必须是布尔值',
  }),
  description: Joi.string().optional().allow('').messages({
    'string.base': '描述必须是字符串',
  }),
  imageUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': '图片URL格式不正确',
  }),
});

export const updateMaterialSchema = Joi.object({
  code: Joi.string().pattern(/^[A-Z0-9-]{2,50}$/).optional().messages({
    'string.pattern.base': '物料编号只能包含大写字母、数字和横杠，长度2-50位',
  }),
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': '物料名称长度不能少于2位',
    'string.max': '物料名称长度不能超过100位',
  }),
  categoryId: Joi.number().integer().positive().optional().messages({
    'number.base': '类目ID必须是数字',
    'number.positive': '类目ID必须是正数',
  }),
  specification: Joi.string().max(200).optional().allow(null, '').messages({
    'string.max': '规格长度不能超过200位',
  }),
  unit: Joi.string().max(20).optional().messages({
    'string.max': '计量单位长度不能超过20位',
  }),
  origin: Joi.string().max(100).optional().allow(null, '').messages({
    'string.max': '产地长度不能超过100位',
  }),
  grade: Joi.string().max(50).optional().allow(null, '').messages({
    'string.max': '品级长度不能超过50位',
  }),
  batchNumber: Joi.string().max(100).optional().allow(null, '').messages({
    'string.max': '批次号长度不能超过100位',
  }),
  warehouseLocation: Joi.string().max(100).optional().allow(null, '').messages({
    'string.max': '仓位长度不能超过100位',
  }),
  unitPrice: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '单价必须是数字',
    'number.min': '单价不能为负数',
  }),
  currentStock: Joi.number().precision(4).min(0).optional().messages({
    'number.base': '当前库存必须是数字',
    'number.min': '当前库存不能为负数',
  }),
  minStock: Joi.number().precision(4).min(0).optional().messages({
    'number.base': '最低库存必须是数字',
    'number.min': '最低库存不能为负数',
  }),
  maxStock: Joi.number().precision(4).positive().optional().allow(null).messages({
    'number.base': '最高库存必须是数字',
    'number.positive': '最高库存必须是正数',
  }),
  isPurchasable: Joi.boolean().optional().messages({
    'boolean.base': 'isPurchasable 必须是布尔值',
  }),
  description: Joi.string().optional().allow(null, '').messages({
    'string.base': '描述必须是字符串',
  }),
  imageUrl: Joi.string().uri().optional().allow(null, '').messages({
    'string.uri': '图片URL格式不正确',
  }),
});

export const updateStockSchema = Joi.object({
  quantity: Joi.number().precision(4).positive().required().messages({
    'number.base': '数量必须是数字',
    'number.positive': '数量必须是正数',
    'any.required': '数量是必填项',
  }),
  type: Joi.string().valid('in', 'out').required().messages({
    'any.only': '类型只能是入库(in)或出库(out)',
    'any.required': '类型是必填项',
  }),
  remark: Joi.string().max(500).optional().allow('').messages({
    'string.max': '备注长度不能超过500位',
  }),
});

export const batchUpdateStockSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        materialId: Joi.number().integer().positive().required().messages({
          'number.base': '物料ID必须是数字',
          'number.positive': '物料ID必须是正数',
          'any.required': '物料ID是必填项',
        }),
        quantity: Joi.number().precision(4).positive().required().messages({
          'number.base': '数量必须是数字',
          'number.positive': '数量必须是正数',
          'any.required': '数量是必填项',
        }),
        type: Joi.string().valid('in', 'out').required().messages({
          'any.only': '类型只能是入库(in)或出库(out)',
          'any.required': '类型是必填项',
        }),
        remark: Joi.string().max(500).optional().allow(''),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': '至少需要一条记录',
      'any.required': 'items是必填项',
    }),
});
