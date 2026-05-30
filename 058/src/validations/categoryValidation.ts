import Joi from 'joi';
import { OrderType } from '../types';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid(...Object.values(OrderType)).required(),
  description: Joi.string().allow(''),
  basePrice: Joi.number().min(0).required(),
  pricePerKm: Joi.number().min(0).required(),
  pricePerKg: Joi.number().min(0).required(),
  startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  nightSurcharge: Joi.number().min(0).default(0),
  weightSurcharge: Joi.number().min(0).default(0),
  sort: Joi.number().default(0)
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100),
  type: Joi.string().valid(...Object.values(OrderType)),
  description: Joi.string().allow(''),
  basePrice: Joi.number().min(0),
  pricePerKm: Joi.number().min(0),
  pricePerKg: Joi.number().min(0),
  startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  nightSurcharge: Joi.number().min(0),
  weightSurcharge: Joi.number().min(0),
  status: Joi.number().valid(0, 1),
  sort: Joi.number()
});

export const categoryListSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).max(100).default(10),
  type: Joi.string().valid(...Object.values(OrderType)),
  status: Joi.number().valid(0, 1)
});

export const categoryIdSchema = Joi.object({
  categoryId: Joi.number().required()
});
