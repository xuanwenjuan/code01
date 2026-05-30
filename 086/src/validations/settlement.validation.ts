import Joi from 'joi';
import { SettlementStatus } from '../types';

export const withdrawSchema = Joi.object({
  body: Joi.object({
    settlementIds: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
      'array.min': '至少选择一个结算记录',
      'any.required': '结算ID列表不能为空'
    }),
    withdrawTransactionId: Joi.string().optional()
  })
});

export const getSettlementListSchema = Joi.object({
  query: Joi.object({
    workerId: Joi.string().uuid().optional(),
    status: Joi.string().valid(...Object.values(SettlementStatus)).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10)
  })
});

export const workerIdSchema = Joi.object({
  params: Joi.object({
    workerId: Joi.string().uuid().required().messages({
      'string.uuid': '师傅ID格式无效',
      'any.required': '师傅ID不能为空'
    })
  })
});

export const settlementIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.uuid': '结算ID格式无效',
      'any.required': '结算ID不能为空'
    })
  })
});
