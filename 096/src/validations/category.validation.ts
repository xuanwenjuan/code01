import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.base': '类目名称必须是字符串',
    'string.min': '类目名称至少2个字符',
    'string.max': '类目名称最多100个字符',
    'any.required': '类目名称不能为空'
  }),
  code: Joi.string().min(2).max(50).required().messages({
    'string.base': '类目编码必须是字符串',
    'string.min': '类目编码至少2个字符',
    'string.max': '类目编码最多50个字符',
    'any.required': '类目编码不能为空'
  }),
  parentId: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': '父类目ID必须是数字',
    'number.integer': '父类目ID必须是整数',
    'number.positive': '父类目ID必须是正数'
  }),
  sort: Joi.number().integer().min(0).default(0).messages({
    'number.base': '排序必须是数字',
    'number.integer': '排序必须是整数',
    'number.min': '排序不能小于0'
  }),
  icon: Joi.string().max(255).allow('').optional().messages({
    'string.max': '图标地址最多255个字符'
  }),
  description: Joi.string().allow('').optional().messages({
    'string.base': '描述必须是字符串'
  }),
  status: Joi.number().integer().valid(0, 1).default(1).messages({
    'any.only': '状态只能是0或1'
  })
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.base': '类目名称必须是字符串',
    'string.min': '类目名称至少2个字符',
    'string.max': '类目名称最多100个字符'
  }),
  code: Joi.string().min(2).max(50).optional().messages({
    'string.base': '类目编码必须是字符串',
    'string.min': '类目编码至少2个字符',
    'string.max': '类目编码最多50个字符'
  }),
  parentId: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': '父类目ID必须是数字',
    'number.integer': '父类目ID必须是整数',
    'number.positive': '父类目ID必须是正数'
  }),
  sort: Joi.number().integer().min(0).optional().messages({
    'number.base': '排序必须是数字',
    'number.integer': '排序必须是整数',
    'number.min': '排序不能小于0'
  }),
  icon: Joi.string().max(255).allow('').optional().messages({
    'string.max': '图标地址最多255个字符'
  }),
  description: Joi.string().allow('').optional().messages({
    'string.base': '描述必须是字符串'
  }),
  status: Joi.number().integer().valid(0, 1).optional().messages({
    'any.only': '状态只能是0或1'
  })
});

export const updateCategoryStatusSchema = Joi.object({
  status: Joi.number().integer().valid(0, 1).required().messages({
    'any.only': '状态只能是0或1',
    'any.required': '状态不能为空'
  })
});

export const getCategoryListSchema = Joi.object({
  page: Joi.number().integer().positive().optional().messages({
    'number.base': '页码必须是数字',
    'number.positive': '页码必须是正数'
  }),
  pageSize: Joi.number().integer().positive().max(100).optional().messages({
    'number.base': '每页数量必须是数字',
    'number.positive': '每页数量必须是正数',
    'number.max': '每页数量最多100条'
  }),
  name: Joi.string().optional().messages({
    'string.base': '搜索名称必须是字符串'
  }),
  status: Joi.number().integer().valid(0, 1).optional().messages({
    'any.only': '状态只能是0或1'
  }),
  parentId: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': '父类目ID必须是数字',
    'number.positive': '父类目ID必须是正数'
  })
});

export const categoryIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '类目ID必须是数字',
    'number.positive': '类目ID必须是正数',
    'any.required': '类目ID不能为空'
  })
});
