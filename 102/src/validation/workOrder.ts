import Joi from 'joi';
import { WorkOrderStatus, WorkOrderStage } from '../constants';

export const createWorkOrderSchema = Joi.object({
  orderNo: Joi.string().required().messages({
    'any.required': '工单号不能为空',
  }),
  wineId: Joi.number().required().messages({
    'any.required': '酒品ID不能为空',
  }),
  name: Joi.string().required().messages({
    'any.required': '工单名称不能为空',
  }),
  currentStage: Joi.string().valid(...Object.values(WorkOrderStage)).optional().default(WorkOrderStage.SORTING_PRESSING).messages({
    'any.only': '阶段值不正确',
  }),
  status: Joi.string().valid(...Object.values(WorkOrderStatus)).optional(),
  targetQuantity: Joi.number().positive().required().messages({
    'any.required': '目标数量不能为空',
    'number.positive': '目标数量必须大于0',
  }),
  actualQuantity: Joi.number().optional(),
  assignedTo: Joi.number().optional(),
  startDate: Joi.date().optional(),
  estimatedEndDate: Joi.date().optional(),
  actualEndDate: Joi.date().optional(),
  remarks: Joi.string().optional(),
  materials: Joi.array().items(
    Joi.object({
      materialId: Joi.number().required().messages({
        'any.required': '原料ID不能为空',
      }),
      quantity: Joi.number().positive().required().messages({
        'any.required': '原料数量不能为空',
        'number.positive': '原料数量必须大于0',
      }),
      unitPrice: Joi.number().optional(),
    })
  ).optional(),
});

export const updateWorkOrderSchema = Joi.object({
  orderNo: Joi.string().optional(),
  wineId: Joi.number().optional(),
  name: Joi.string().optional(),
  currentStage: Joi.string().valid(...Object.values(WorkOrderStage)).optional().messages({
    'any.only': '阶段值不正确',
  }),
  status: Joi.string().valid(...Object.values(WorkOrderStatus)).optional().messages({
    'any.only': '状态值不正确',
  }),
  targetQuantity: Joi.number().positive().optional().messages({
    'number.positive': '目标数量必须大于0',
  }),
  actualQuantity: Joi.number().optional(),
  assignedTo: Joi.number().optional(),
  startDate: Joi.date().optional(),
  estimatedEndDate: Joi.date().optional(),
  actualEndDate: Joi.date().optional(),
  remarks: Joi.string().optional(),
});

export const advanceStageSchema = Joi.object({
  quantity: Joi.number().positive().optional().messages({
    'number.positive': '数量必须大于0',
  }),
  temperature: Joi.string().optional(),
  notes: Joi.string().optional(),
});

export const rollbackStageSchema = Joi.object({
  reason: Joi.string().optional(),
});

export const completeWorkOrderSchema = Joi.object({
  actualQuantity: Joi.number().positive().optional().messages({
    'number.positive': '实际数量必须大于0',
  }),
  bottleCount: Joi.number().integer().optional().messages({
    'number.integer': '瓶数必须为整数',
  }),
  notes: Joi.string().optional(),
});

export const suspendWorkOrderSchema = Joi.object({
  reason: Joi.string().optional(),
});

export const selectAndLockMaterialsSchema = Joi.object({
  materials: Joi.array().items(
    Joi.object({
      materialId: Joi.number().required().messages({
        'any.required': '原料ID不能为空',
      }),
      quantity: Joi.number().positive().required().messages({
        'any.required': '原料数量不能为空',
        'number.positive': '原料数量必须大于0',
      }),
      remarks: Joi.string().optional(),
    })
  ).required().messages({
    'any.required': '原料列表不能为空',
  }),
  autoLock: Joi.boolean().optional().default(true),
});

export const unlockMaterialsSchema = Joi.object({
  materialIds: Joi.array().items(Joi.number()).optional(),
});

export const recordMaterialLossSchema = Joi.object({
  lossItems: Joi.array().items(
    Joi.object({
      materialId: Joi.number().required().messages({
        'any.required': '原料ID不能为空',
      }),
      lossQuantity: Joi.number().positive().required().messages({
        'any.required': '损耗数量不能为空',
        'number.positive': '损耗数量必须大于0',
      }),
      remarks: Joi.string().optional(),
    })
  ).required().messages({
    'any.required': '损耗列表不能为空',
  }),
  reason: Joi.string().optional(),
});

export const recordMaterialUsageSchema = Joi.object({
  usageItems: Joi.array().items(
    Joi.object({
      materialId: Joi.number().required().messages({
        'any.required': '原料ID不能为空',
      }),
      actualQuantity: Joi.number().positive().required().messages({
        'any.required': '实际用量不能为空',
        'number.positive': '实际用量必须大于0',
      }),
      remarks: Joi.string().optional(),
    })
  ).required().messages({
    'any.required': '使用记录列表不能为空',
  }),
});

export const workOrderIdSchema = Joi.object({
  workOrderId: Joi.number().required().messages({
    'any.required': '工单ID不能为空',
  }),
});
