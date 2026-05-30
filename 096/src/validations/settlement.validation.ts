import Joi from 'joi';
import { SettlementType, SettlementStatus } from '../models/Settlement';

export const createSettlementSchema = Joi.object({
  type: Joi.string().valid(...Object.values(SettlementType)).required().messages({
    'any.only': '结算类型不合法',
    'any.required': '结算类型不能为空'
  }),
  workOrderId: Joi.number().integer().positive().optional().messages({
    'number.base': '工单ID必须是数字',
    'number.positive': '工单ID必须是正数'
  }),
  categoryId: Joi.number().integer().positive().optional().messages({
    'number.base': '类目ID必须是数字',
    'number.positive': '类目ID必须是正数'
  }),
  startDate: Joi.date().iso().required().messages({
    'date.base': '开始日期格式不正确',
    'date.iso': '开始日期必须是ISO格式',
    'any.required': '开始日期不能为空'
  }),
  endDate: Joi.date().iso().required().messages({
    'date.base': '结束日期格式不正确',
    'date.iso': '结束日期必须是ISO格式',
    'any.required': '结束日期不能为空'
  }),
  totalWorkOrders: Joi.number().integer().min(0).optional().messages({
    'number.base': '总工单数必须是数字',
    'number.min': '总工单数不能为负数'
  }),
  totalLaborFee: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '总工时费必须是数字',
    'number.min': '总工时费不能为负数'
  }),
  totalPartsFee: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '总配件费必须是数字',
    'number.min': '总配件费不能为负数'
  }),
  totalRepairIncome: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '维修总收入必须是数字',
    'number.min': '维修总收入不能为负数'
  }),
  totalCommissionAmount: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '总佣金必须是数字',
    'number.min': '总佣金不能为负数'
  }),
  totalConsignIncome: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '寄卖总收入必须是数字',
    'number.min': '寄卖总收入不能为负数'
  }),
  repairerShare: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '维修师分成必须是数字',
    'number.min': '维修师分成不能为负数'
  }),
  storeShare: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '门店分成必须是数字',
    'number.min': '门店分成不能为负数'
  }),
  platformShare: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '平台分成必须是数字',
    'number.min': '平台分成不能为负数'
  }),
  remarks: Joi.string().allow('').optional().messages({
    'string.base': '备注必须是字符串'
  })
});

export const generateMonthlySettlementSchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).required().messages({
    'number.base': '年份必须是数字',
    'number.min': '年份不能早于2000年',
    'number.max': '年份不能晚于2100年',
    'any.required': '年份不能为空'
  }),
  month: Joi.number().integer().min(1).max(12).required().messages({
    'number.base': '月份必须是数字',
    'number.min': '月份不能小于1',
    'number.max': '月份不能大于12',
    'any.required': '月份不能为空'
  }),
  type: Joi.string().valid(...Object.values(SettlementType)).required().messages({
    'any.only': '结算类型不合法',
    'any.required': '结算类型不能为空'
  })
});

export const getSettlementListSchema = Joi.object({
  page: Joi.number().integer().positive().optional().messages({
    'number.base': '页码必须是数字',
    'number.positive': '页码必须是正数'
  }),
  pageSize: Joi.number().integer().positive().max(100).optional().messages({
    'number.base': '每页数量必须是数字',
    'number.positive': '每页数量必须是正数',
    'number.max': '每页数量最多100条'
  }),
  type: Joi.string().valid(...Object.values(SettlementType)).optional().messages({
    'any.only': '结算类型不合法'
  }),
  status: Joi.string().valid(...Object.values(SettlementStatus)).optional().messages({
    'any.only': '结算状态不合法'
  }),
  startDate: Joi.date().iso().optional().messages({
    'date.base': '开始日期格式不正确',
    'date.iso': '开始日期必须是ISO格式'
  }),
  endDate: Joi.date().iso().optional().messages({
    'date.base': '结束日期格式不正确',
    'date.iso': '结束日期必须是ISO格式'
  })
});

export const settlementIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '结算单ID必须是数字',
    'number.positive': '结算单ID必须是正数',
    'any.required': '结算单ID不能为空'
  })
});

export const statisticsByCategorySchema = Joi.object({
  startDate: Joi.date().iso().required().messages({
    'date.base': '开始日期格式不正确',
    'date.iso': '开始日期必须是ISO格式',
    'any.required': '开始日期不能为空'
  }),
  endDate: Joi.date().iso().required().messages({
    'date.base': '结束日期格式不正确',
    'date.iso': '结束日期必须是ISO格式',
    'any.required': '结束日期不能为空'
  })
});

export const statisticsByRepairerSchema = Joi.object({
  startDate: Joi.date().iso().required().messages({
    'date.base': '开始日期格式不正确',
    'date.iso': '开始日期必须是ISO格式',
    'any.required': '开始日期不能为空'
  }),
  endDate: Joi.date().iso().required().messages({
    'date.base': '结束日期格式不正确',
    'date.iso': '结束日期必须是ISO格式',
    'any.required': '结束日期不能为空'
  })
});

export const exportSettlementDataSchema = Joi.object({
  startDate: Joi.date().iso().required().messages({
    'date.base': '开始日期格式不正确',
    'date.iso': '开始日期必须是ISO格式',
    'any.required': '开始日期不能为空'
  }),
  endDate: Joi.date().iso().required().messages({
    'date.base': '结束日期格式不正确',
    'date.iso': '结束日期必须是ISO格式',
    'any.required': '结束日期不能为空'
  }),
  type: Joi.string().valid(...Object.values(SettlementType)).optional().messages({
    'any.only': '结算类型不合法'
  })
});
