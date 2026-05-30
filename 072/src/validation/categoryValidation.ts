import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': '类目名称不能为空',
    'string.max': '类目名称不能超过100个字符',
    'any.required': '类目名称是必填项'
  }),
  parentId: Joi.number().integer().allow(null).optional(),
  description: Joi.string().max(500).optional().messages({
    'string.max': '描述不能超过500个字符'
  }),
  sortOrder: Joi.number().integer().min(0).default(0).messages({
    'number.min': '排序序号不能小于0'
  })
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.empty': '类目名称不能为空',
    'string.max': '类目名称不能超过100个字符'
  }),
  parentId: Joi.number().integer().allow(null).optional(),
  description: Joi.string().max(500).optional().messages({
    'string.max': '描述不能超过500个字符'
  }),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    'number.min': '排序序号不能小于0'
  }),
  status: Joi.number().integer().valid(0, 1).optional().messages({
    'any.only': '状态值只能是0或1'
  })
});

export const toggleCategoryStatusSchema = Joi.object({
  status: Joi.number().integer().valid(0, 1).required().messages({
    'any.required': '状态值是必填项',
    'any.only': '状态值只能是0或1'
  })
});
