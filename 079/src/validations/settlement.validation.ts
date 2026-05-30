import Joi from 'joi'

export const createSettlementSchema = Joi.object({
  dealerId: Joi.number().integer().positive().required().messages({
    'number.base': '经销商ID必须是数字',
    'number.integer': '经销商ID必须是整数',
    'number.positive': '经销商ID必须是正整数',
    'any.required': '经销商ID是必填项'
  }),
  startDate: Joi.date().required().messages({
    'date.base': '开始日期格式不正确',
    'any.required': '开始日期是必填项'
  }),
  endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
    'date.base': '结束日期格式不正确',
    'date.greater': '结束日期必须晚于开始日期',
    'any.required': '结束日期是必填项'
  })
})

export const updateSettlementStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'partial', 'completed').required().messages({
    'string.base': '结算状态必须是字符串',
    'any.only': '结算状态必须是: pending, partial, completed',
    'any.required': '结算状态是必填项'
  }),
  paidAmount: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '已付金额必须是数字',
    'number.min': '已付金额不能小于0',
    'number.precision': '已付金额最多保留2位小数'
  }),
  remarks: Joi.string().allow(null, '').messages({
    'string.base': '备注必须是字符串'
  })
})

export const getDealerStatisticsSchema = Joi.object({
  dealerId: Joi.number().integer().positive().optional().messages({
    'number.base': '经销商ID必须是数字',
    'number.integer': '经销商ID必须是整数',
    'number.positive': '经销商ID必须是正整数'
  }),
  year: Joi.number().integer().min(2000).max(2100).optional().messages({
    'number.base': '年份必须是数字',
    'number.integer': '年份必须是整数',
    'number.min': '年份不能小于2000',
    'number.max': '年份不能大于2100'
  }),
  quarter: Joi.number().integer().min(1).max(4).optional().messages({
    'number.base': '季度必须是数字',
    'number.integer': '季度必须是整数',
    'number.min': '季度不能小于1',
    'number.max': '季度不能大于4'
  })
})

export const settlementIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '结算ID必须是数字',
    'number.integer': '结算ID必须是整数',
    'number.positive': '结算ID必须是正整数',
    'any.required': '结算ID是必填项'
  })
})
