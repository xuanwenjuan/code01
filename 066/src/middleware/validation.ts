import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseUtil } from '../utils/response';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate({
      ...req.params,
      ...req.query,
      ...req.body
    }, { abortEarly: false });

    if (error) {
      const errors = error.details.map(d => d.message).join(', ');
      return ResponseUtil.error(res, errors, 400);
    }

    next();
  };
};

export const schemas = {
  category: {
    create: Joi.object({
      name: Joi.string().required().max(100).messages({
        'string.empty': '类目名称不能为空',
        'any.required': '类目名称是必填项'
      }),
      code: Joi.string().required().max(50).messages({
        'string.empty': '类目编码不能为空',
        'any.required': '类目编码是必填项'
      }),
      parentId: Joi.number().optional().allow(null),
      sort: Joi.number().optional().default(0),
      description: Joi.string().optional().allow('')
    }),
    update: Joi.object({
      id: Joi.number().required(),
      name: Joi.string().optional().max(100),
      code: Joi.string().optional().max(50),
      parentId: Joi.number().optional().allow(null),
      sort: Joi.number().optional(),
      status: Joi.string().valid('active', 'disabled', 'archived').optional(),
      description: Joi.string().optional().allow('')
    })
  },
  supplier: {
    create: Joi.object({
      name: Joi.string().required().max(200),
      code: Joi.string().required().max(50),
      contactPerson: Joi.string().required().max(50),
      phone: Joi.string().required().max(20),
      brand: Joi.string().required().max(100),
      categoryIds: Joi.string().optional().allow(''),
      supplyCycle: Joi.number().optional().default(7),
      settlementPeriod: Joi.number().optional().default(30),
      status: Joi.string().valid('cooperating', 'suspended', 'terminated').optional()
    }),
    update: Joi.object({
      id: Joi.number().required(),
      name: Joi.string().optional().max(200),
      code: Joi.string().optional().max(50),
      contactPerson: Joi.string().optional().max(50),
      phone: Joi.string().optional().max(20),
      brand: Joi.string().optional().max(100),
      categoryIds: Joi.string().optional().allow(''),
      supplyCycle: Joi.number().optional(),
      settlementPeriod: Joi.number().optional(),
      status: Joi.string().valid('cooperating', 'suspended', 'terminated').optional()
    })
  },
  purchase: {
    create: Joi.object({
      supplierId: Joi.number().required(),
      expectDate: Joi.date().optional(),
      items: Joi.array().items(
        Joi.object({
          productId: Joi.number().required(),
          quantity: Joi.number().positive().required(),
          price: Joi.number().positive().required()
        })
      ).min(1).required()
    })
  },
  sales: {
    create: Joi.object({
      customerName: Joi.string().required().max(100),
      customerPhone: Joi.string().optional().max(20),
      paidAmount: Joi.number().optional().default(0),
      items: Joi.array().items(
        Joi.object({
          productId: Joi.number().required(),
          quantity: Joi.number().positive().required(),
          price: Joi.number().positive().required()
        })
      ).min(1).required()
    })
  }
};
