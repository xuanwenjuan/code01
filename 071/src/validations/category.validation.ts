import Joi from 'joi';

export const createCategorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required().max(50).messages({
      'string.empty': '类目名称不能为空',
      'string.max': '类目名称不能超过50个字符'
    }),
    parentId: Joi.number().integer().min(0).default(0),
    icon: Joi.string().uri().optional(),
    sort: Joi.number().integer().min(0).default(0)
  })
});

export const updateCategorySchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  }),
  body: Joi.object({
    name: Joi.string().max(50).optional(),
    parentId: Joi.number().integer().min(0).optional(),
    icon: Joi.string().uri().optional().allow(''),
    sort: Joi.number().integer().min(0).optional(),
    status: Joi.number().integer().valid(0, 1).optional()
  }).min(1)
});

export const getCategorySchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  })
});

export const deleteCategorySchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  })
});
