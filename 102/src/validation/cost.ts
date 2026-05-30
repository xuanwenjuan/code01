import Joi from 'joi';

export const createCostSettlementSchema = Joi.object({
  settlementNo: Joi.string().required().messages({
    'any.required': '结算单号不能为空',
  }),
  wineId: Joi.number().positive().required().messages({
    'any.required': '酒品ID不能为空',
    'number.positive': '酒品ID必须大于0',
  }),
  workOrderId: Joi.number().positive().optional().messages({
    'number.positive': '工单ID必须大于0',
  }),
  materialCost: Joi.number().min(0).optional().default(0),
  laborCost: Joi.number().min(0).optional().default(0),
  storageCost: Joi.number().min(0).optional().default(0),
  otherCost: Joi.number().min(0).optional().default(0),
  totalCost: Joi.number().min(0).optional().default(0),
  unitCost: Joi.number().min(0).optional().default(0),
  quantity: Joi.number().positive().required().messages({
    'any.required': '数量不能为空',
    'number.positive': '数量必须大于0',
  }),
  estimatedProfit: Joi.number().optional(),
  profitMargin: Joi.number().optional(),
  settlementDate: Joi.date().required().messages({
    'any.required': '结算日期不能为空',
  }),
  remarks: Joi.string().max(500).optional().messages({
    'string.max': '备注最多500字符',
  }),
  costDetails: Joi.array().items(
    Joi.object({
      costType: Joi.string().valid('material', 'labor', 'storage', 'other').required().messages({
        'any.required': '成本类型不能为空',
        'any.only': '成本类型只能是 material、labor、storage 或 other',
      }),
      materialId: Joi.number().positive().optional().messages({
        'number.positive': '原料ID必须大于0',
      }),
      materialName: Joi.string().optional(),
      quantity: Joi.number().positive().optional().messages({
        'number.positive': '数量必须大于0',
      }),
      unit: Joi.string().optional(),
      unitPrice: Joi.number().min(0).optional(),
      totalPrice: Joi.number().min(0).required().messages({
        'any.required': '总价不能为空',
        'number.min': '总价不能小于0',
      }),
      description: Joi.string().max(500).optional().messages({
        'string.max': '描述最多500字符',
      }),
    })
  ).optional(),
});

export const updateCostSettlementSchema = Joi.object({
  settlementNo: Joi.string().optional(),
  wineId: Joi.number().positive().optional().messages({
    'number.positive': '酒品ID必须大于0',
  }),
  workOrderId: Joi.number().positive().optional().messages({
    'number.positive': '工单ID必须大于0',
  }),
  materialCost: Joi.number().min(0).optional(),
  laborCost: Joi.number().min(0).optional(),
  storageCost: Joi.number().min(0).optional(),
  otherCost: Joi.number().min(0).optional(),
  totalCost: Joi.number().min(0).optional(),
  unitCost: Joi.number().min(0).optional(),
  quantity: Joi.number().positive().optional().messages({
    'number.positive': '数量必须大于0',
  }),
  estimatedProfit: Joi.number().optional(),
  profitMargin: Joi.number().optional(),
  settlementDate: Joi.date().optional(),
  remarks: Joi.string().max(500).optional().messages({
    'string.max': '备注最多500字符',
  }),
  costDetails: Joi.array().items(
    Joi.object({
      costType: Joi.string().valid('material', 'labor', 'storage', 'other').required().messages({
        'any.required': '成本类型不能为空',
        'any.only': '成本类型只能是 material、labor、storage 或 other',
      }),
      materialId: Joi.number().positive().optional().messages({
        'number.positive': '原料ID必须大于0',
      }),
      materialName: Joi.string().optional(),
      quantity: Joi.number().positive().optional().messages({
        'number.positive': '数量必须大于0',
      }),
      unit: Joi.string().optional(),
      unitPrice: Joi.number().min(0).optional(),
      totalPrice: Joi.number().min(0).required().messages({
        'any.required': '总价不能为空',
        'number.min': '总价不能小于0',
      }),
      description: Joi.string().max(500).optional().messages({
        'string.max': '描述最多500字符',
      }),
    })
  ).optional(),
});
