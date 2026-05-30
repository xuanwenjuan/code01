import Joi from 'joi';
import { SettlementStatus } from '../types';

export const createSettlementSchema = Joi.object({
  riderId: Joi.number().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required()
});

export const batchCreateSettlementSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required()
});

export const settlementIdSchema = Joi.object({
  settlementId: Joi.number().required(),
  remark: Joi.string()
});

export const settlementListSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).max(100).default(10),
  status: Joi.string().valid(...Object.values(SettlementStatus)),
  startDate: Joi.date(),
  endDate: Joi.date(),
  riderId: Joi.number()
});
