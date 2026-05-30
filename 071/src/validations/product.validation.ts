import Joi from 'joi';

export const createProductSchema = Joi.object({
  body: Joi.object({
    categoryId: Joi.number().integer().required(),
    name: Joi.string().required().max(100),
    image: Joi.string().uri().optional(),
    images: Joi.string().optional(),
    description: Joi.string().optional(),
    specs: Joi.string().optional(),
    unit: Joi.string().required().max(20),
    originPrice: Joi.number().min(0).required(),
    groupPrice: Joi.number().min(0).required(),
    supplierId: Joi.number().integer().required(),
    stock: Joi.number().integer().min(0).default(0),
    sort: Joi.number().integer().min(0).default(0)
  })
});

export const updateProductSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  }),
  body: Joi.object({
    categoryId: Joi.number().integer().optional(),
    name: Joi.string().max(100).optional(),
    image: Joi.string().uri().optional().allow(''),
    images: Joi.string().optional().allow(''),
    description: Joi.string().optional().allow(''),
    specs: Joi.string().optional().allow(''),
    unit: Joi.string().max(20).optional(),
    originPrice: Joi.number().min(0).optional(),
    groupPrice: Joi.number().min(0).optional(),
    supplierId: Joi.number().integer().optional(),
    stock: Joi.number().integer().min(0).optional(),
    sort: Joi.number().integer().min(0).optional(),
    status: Joi.number().integer().valid(0, 1).optional()
  }).min(1)
});

export const getProductSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  })
});
