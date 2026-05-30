import Joi from 'joi';
import { MaterialCategoryType } from '../constants';

export const createCategorySchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': '分类名称不能为空',
  }),
  code: Joi.string().required().messages({
    'any.required': '分类编码不能为空',
  }),
  type: Joi.string().valid(...Object.values(MaterialCategoryType)).required().messages({
    'any.required': '分类类型不能为空',
    'any.only': '分类类型值不正确',
  }),
  parentId: Joi.number().optional().allow(null),
  level: Joi.number().optional().default(1),
  sort: Joi.number().optional().default(0),
  description: Joi.string().optional(),
  status: Joi.boolean().optional().default(true),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().optional(),
  code: Joi.string().optional(),
  type: Joi.string().valid(...Object.values(MaterialCategoryType)).optional().messages({
    'any.only': '分类类型值不正确',
  }),
  parentId: Joi.number().optional().allow(null),
  level: Joi.number().optional(),
  sort: Joi.number().optional(),
  description: Joi.string().optional(),
  status: Joi.boolean().optional(),
});

export const updateCategoryStatusSchema = Joi.object({
  status: Joi.boolean().required().messages({
    'any.required': '状态不能为空',
  }),
  cascade: Joi.boolean().optional().default(false),
});

export const createMaterialSchema = Joi.object({
  categoryId: Joi.number().required().messages({
    'any.required': '分类ID不能为空',
  }),
  name: Joi.string().required().messages({
    'any.required': '原料名称不能为空',
  }),
  code: Joi.string().required().messages({
    'any.required': '原料编码不能为空',
  }),
  specification: Joi.string().optional(),
  unit: Joi.string().required().messages({
    'any.required': '单位不能为空',
  }),
  unitPrice: Joi.number().optional().default(0),
  stock: Joi.number().optional().default(0),
  minStock: Joi.number().optional().default(0),
  origin: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.boolean().optional().default(true),
});

export const updateMaterialSchema = Joi.object({
  categoryId: Joi.number().optional(),
  name: Joi.string().optional(),
  code: Joi.string().optional(),
  specification: Joi.string().optional(),
  unit: Joi.string().optional(),
  unitPrice: Joi.number().optional(),
  stock: Joi.number().optional(),
  minStock: Joi.number().optional(),
  origin: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.boolean().optional(),
});

export const batchStockInSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      materialId: Joi.number().required().messages({
        'any.required': '原料ID不能为空',
      }),
      quantity: Joi.number().positive().required().messages({
        'any.required': '入库数量不能为空',
        'number.positive': '入库数量必须大于0',
      }),
      remark: Joi.string().optional(),
    })
  ).min(1).required().messages({
    'array.min': '入库列表不能为空',
    'any.required': '入库列表不能为空',
  }),
});
