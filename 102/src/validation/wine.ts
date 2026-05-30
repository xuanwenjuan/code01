import Joi from 'joi';
import { WineStatus } from '../constants';

export const createWineSchema = Joi.object({
  batchNo: Joi.string().required().messages({
    'any.required': '批次号不能为空',
  }),
  name: Joi.string().required().messages({
    'any.required': '酒品名称不能为空',
  }),
  origin: Joi.string().required().messages({
    'any.required': '产区不能为空',
  }),
  vintageYear: Joi.number().required().messages({
    'any.required': '酿造年份不能为空',
  }),
  alcoholContent: Joi.number().min(0).max(100).required().messages({
    'any.required': '酒精度不能为空',
    'number.min': '酒精度不能小于0',
    'number.max': '酒精度不能大于100',
  }),
  flavorProfile: Joi.string().required().messages({
    'any.required': '口感香型不能为空',
  }),
  description: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(WineStatus)).optional().default(WineStatus.BREWING),
  totalQuantity: Joi.number().optional().default(0),
  currentQuantity: Joi.number().optional().default(0),
  bottleCount: Joi.number().integer().optional(),
  bestDrinkStartDate: Joi.date().optional(),
  bestDrinkEndDate: Joi.date().optional(),
  cellarLocation: Joi.string().optional(),
});

export const updateWineSchema = Joi.object({
  batchNo: Joi.string().optional(),
  name: Joi.string().optional(),
  origin: Joi.string().optional(),
  vintageYear: Joi.number().optional(),
  alcoholContent: Joi.number().min(0).max(100).optional().messages({
    'number.min': '酒精度不能小于0',
    'number.max': '酒精度不能大于100',
  }),
  flavorProfile: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(WineStatus)).optional(),
  totalQuantity: Joi.number().optional(),
  currentQuantity: Joi.number().optional(),
  bottleCount: Joi.number().integer().optional(),
  bestDrinkStartDate: Joi.date().optional(),
  bestDrinkEndDate: Joi.date().optional(),
  cellarLocation: Joi.string().optional(),
});

export const updateWineStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(WineStatus)).required().messages({
    'any.required': '状态不能为空',
    'any.only': '状态值不正确',
  }),
  reason: Joi.string().optional(),
});

export const batchUpdateWineStatusSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer()).min(1).required().messages({
    'array.min': '酒品ID列表不能为空',
    'any.required': '酒品ID列表不能为空',
  }),
  status: Joi.string().valid(...Object.values(WineStatus)).required().messages({
    'any.required': '状态不能为空',
    'any.only': '状态值不正确',
  }),
  reason: Joi.string().optional(),
});

export const batchCreateWineSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      batchNo: Joi.string().required().messages({
        'any.required': '批次号不能为空',
      }),
      name: Joi.string().required().messages({
        'any.required': '酒品名称不能为空',
      }),
      origin: Joi.string().required().messages({
        'any.required': '产区不能为空',
      }),
      vintageYear: Joi.number().required().messages({
        'any.required': '酿造年份不能为空',
      }),
      alcoholContent: Joi.number().min(0).max(100).required().messages({
        'any.required': '酒精度不能为空',
        'number.min': '酒精度不能小于0',
        'number.max': '酒精度不能大于100',
      }),
      flavorProfile: Joi.string().required().messages({
        'any.required': '口感香型不能为空',
      }),
      description: Joi.string().optional(),
      status: Joi.string().valid(...Object.values(WineStatus)).optional(),
      totalQuantity: Joi.number().optional(),
      currentQuantity: Joi.number().optional(),
      bottleCount: Joi.number().integer().optional(),
      bestDrinkStartDate: Joi.date().optional(),
      bestDrinkEndDate: Joi.date().optional(),
      cellarLocation: Joi.string().optional(),
    })
  ).min(1).required().messages({
    'array.min': '酒品列表不能为空',
    'any.required': '酒品列表不能为空',
  }),
});
