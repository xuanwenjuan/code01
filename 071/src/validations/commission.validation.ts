import Joi from 'joi';

export const getCommissionListSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string().valid('pending', 'settled', 'withdrawn').optional(),
    leaderId: Joi.number().integer().optional(),
    settlementPeriod: Joi.string().optional(),
    startDate: Joi.string().optional(),
    endDate: Joi.string().optional()
  })
});

export const settleCommissionSchema = Joi.object({
  body: Joi.object({
    commissionIds: Joi.array().items(Joi.number().integer().required()).required(),
    settlementPeriod: Joi.string().required()
  })
});

export const withdrawCommissionSchema = Joi.object({
  body: Joi.object({
    commissionIds: Joi.array().items(Joi.number().integer().required()).required()
  })
});
