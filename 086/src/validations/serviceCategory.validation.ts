import Joi from 'joi';
import { ServiceCategoryStatus } from '../types';

export const createServiceCategorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
      'string.min': '类目名称至少1个字符',
      'string.max': '类目名称最多100个字符',
      'any.required': '类目名称不能为空'
    }),
    parentId: Joi.string().uuid().optional().allow(null).messages({
      'string.uuid': '父类目ID格式无效'
    }),
    description: Joi.string().max(1000).optional(),
    icon: Joi.string().uri().optional(),
    sortOrder: Joi.number().integer().min(0).default(0).messages({
      'number.base': '排序必须是数字',
      'number.min': '排序不能小于0'
    }),
    commissionRate: Joi.number().min(0).max(100).default(10).messages({
      'number.base': '佣金比例必须是数字',
      'number.min': '佣金比例不能小于0',
      'number.max': '佣金比例不能大于100'
    }),
    basePrice: Joi.number().min(0).optional().messages({
      'number.base': '基础价格必须是数字',
      'number.min': '基础价格不能小于0'
    }),
    unit: Joi.string().max(20).optional()
  })
});

export const updateServiceCategorySchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.uuid': '类目ID格式无效',
      'any.required': '类目ID不能为空'
    })
  }),
  body: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    parentId: Joi.string().uuid().optional().allow(null),
    description: Joi.string().max(1000).optional(),
    icon: Joi.string().uri().optional(),
    sortOrder: Joi.number().integer().min(0).optional(),
    status: Joi.string().valid(...Object.values(ServiceCategoryStatus)).optional(),
    commissionRate: Joi.number().min(0).max(100).optional(),
    basePrice: Joi.number().min(0).optional(),
    unit: Joi.string().max(20).optional()
  })
});

export const updateSortOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required()
  }),
  body: Joi.object({
    sortOrder: Joi.number().integer().min(0).required()
  })
});

export const getCategoryListSchema = Joi.object({
  query: Joi.object({
    parentId: Joi.string().uuid().optional().allow(''),
    status: Joi.string().valid(...Object.values(ServiceCategoryStatus)).optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10)
  })
});
