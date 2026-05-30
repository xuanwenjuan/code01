import Joi from 'joi';
import { UserRole } from './constants';
import { InfluencerStatus } from './constants';
import { OrderStatus } from './constants';
import { SettlementStatus } from './constants';
import { CategoryStatus } from './constants';

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
});

export const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const idsSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

export const userRoleSchema = Joi.string().valid(...Object.values(UserRole));
export const influencerStatusSchema = Joi.string().valid(...Object.values(InfluencerStatus));
export const orderStatusSchema = Joi.string().valid(...Object.values(OrderStatus));
export const settlementStatusSchema = Joi.string().valid(...Object.values(SettlementStatus));
export const categoryStatusSchema = Joi.string().valid(...Object.values(CategoryStatus));

export const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
});

export const priceRangeSchema = Joi.object({
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(Joi.ref('minPrice')),
});

export const sortSchema = Joi.object({
  sortBy: Joi.string(),
  sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('desc'),
});

export const searchSchema = Joi.object({
  keyword: Joi.string().allow('').max(100),
});

export const validatePageParams = (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 10));
  return { page, pageSize };
};

export const validateId = (id: any): number | null => {
  const parsed = parseInt(id);
  return !isNaN(parsed) && parsed > 0 ? parsed : null;
};

export const validateDateRange = (startDate: any, endDate: any): { startDate?: Date; endDate?: Date } => {
  const result: { startDate?: Date; endDate?: Date } = {};
  if (startDate) result.startDate = new Date(startDate);
  if (endDate) result.endDate = new Date(endDate);
  return result;
};
