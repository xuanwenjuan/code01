import Joi from 'joi';

export const createMaterialConsumptionSchema = Joi.object({
  workOrderId: Joi.number().integer().positive().required().messages({
    'number.base': '工单ID必须是数字',
    'number.integer': '工单ID必须是整数',
    'number.positive': '工单ID必须是正数',
    'any.required': '工单ID是必填项',
  }),
  materialId: Joi.number().integer().positive().required().messages({
    'number.base': '物料ID必须是数字',
    'number.integer': '物料ID必须是整数',
    'number.positive': '物料ID必须是正数',
    'any.required': '物料ID是必填项',
  }),
  plannedQuantity: Joi.number().precision(4).positive().required().messages({
    'number.base': '计划用量必须是数字',
    'number.positive': '计划用量必须是正数',
    'any.required': '计划用量是必填项',
  }),
  actualQuantity: Joi.number().precision(4).min(0).optional().messages({
    'number.base': '实际用量必须是数字',
    'number.min': '实际用量不能为负数',
  }),
  wasteQuantity: Joi.number().precision(4).min(0).optional().messages({
    'number.base': '损耗量必须是数字',
    'number.min': '损耗量不能为负数',
  }),
  unitPrice: Joi.number().precision(2).positive().optional().messages({
    'number.base': '单价必须是数字',
    'number.positive': '单价必须是正数',
  }),
  remark: Joi.string().max(500).optional().allow('').messages({
    'string.max': '备注长度不能超过500位',
  }),
});

export const updateMaterialConsumptionSchema = Joi.object({
  plannedQuantity: Joi.number().precision(4).positive().optional().messages({
    'number.base': '计划用量必须是数字',
    'number.positive': '计划用量必须是正数',
  }),
  actualQuantity: Joi.number().precision(4).min(0).optional().messages({
    'number.base': '实际用量必须是数字',
    'number.min': '实际用量不能为负数',
  }),
  wasteQuantity: Joi.number().precision(4).min(0).optional().messages({
    'number.base': '损耗量必须是数字',
    'number.min': '损耗量不能为负数',
  }),
  unitPrice: Joi.number().precision(2).positive().optional().messages({
    'number.base': '单价必须是数字',
    'number.positive': '单价必须是正数',
  }),
  remark: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': '备注长度不能超过500位',
  }),
});

export const getMaterialLedgerSchema = Joi.object({
  startDate: Joi.date().optional().messages({
    'date.base': '开始日期格式不正确',
  }),
  endDate: Joi.date().optional().messages({
    'date.base': '结束日期格式不正确',
  }),
  categoryId: Joi.number().integer().positive().optional().messages({
    'number.base': '类目ID必须是数字',
    'number.integer': '类目ID必须是整数',
    'number.positive': '类目ID必须是正数',
  }),
  workOrderId: Joi.number().integer().positive().optional().messages({
    'number.base': '工单ID必须是数字',
    'number.integer': '工单ID必须是整数',
    'number.positive': '工单ID必须是正数',
  }),
  export: Joi.boolean().optional().messages({
    'boolean.base': 'export 必须是布尔值',
  }),
});
