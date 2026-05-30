import Joi from 'joi';

export const createCategorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required().messages({
      'string.empty': '类目名称不能为空',
      'any.required': '类目名称是必填项'
    }),
    code: Joi.string().required().messages({
      'string.empty': '类目编码不能为空',
      'any.required': '类目编码是必填项'
    }),
    type: Joi.string().valid('concentrate', 'forage', 'supplement', 'medicine').required().messages({
      'any.only': '类型必须是 concentrate、forage、supplement 或 medicine',
      'any.required': '类型是必填项'
    }),
    parentId: Joi.number().integer().positive().optional(),
    level: Joi.number().integer().positive().default(1),
    sortOrder: Joi.number().integer().default(0),
    description: Joi.string().optional(),
    unit: Joi.string().default('kg')
  })
});

export const updateCategorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().optional(),
    code: Joi.string().optional(),
    type: Joi.string().valid('concentrate', 'forage', 'supplement', 'medicine').optional(),
    parentId: Joi.number().integer().positive().allow(null).optional(),
    level: Joi.number().integer().positive().optional(),
    sortOrder: Joi.number().integer().optional(),
    status: Joi.string().valid('active', 'inactive', 'obsolete').optional(),
    description: Joi.string().optional(),
    unit: Joi.string().optional()
  }),
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  })
});
