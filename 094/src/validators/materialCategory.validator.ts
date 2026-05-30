import Joi from 'joi';

export const createMaterialCategorySchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': '类目名称不能为空',
    'any.required': '类目名称是必填项',
  }),
  code: Joi.string().required().messages({
    'string.empty': '类目编码不能为空',
    'any.required': '类目编码是必填项',
  }),
  parentId: Joi.number().integer().positive().optional(),
  description: Joi.string().optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateMaterialCategorySchema = Joi.object({
  name: Joi.string().optional(),
  code: Joi.string().optional(),
  parentId: Joi.number().integer().positive().optional().allow(null),
  description: Joi.string().optional().allow(null, ''),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});
