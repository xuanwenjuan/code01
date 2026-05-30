import Joi from 'joi';
import { OrderType, OrderStatus } from '../types';

export const createOrderSchema = Joi.object({
  type: Joi.string().valid(...Object.values(OrderType)).required(),
  categoryId: Joi.number().required(),
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow(''),
  pickupAddress: Joi.string().required(),
  pickupLat: Joi.number(),
  pickupLng: Joi.number(),
  pickupContact: Joi.string().required(),
  pickupPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '请输入有效的手机号'
  }),
  deliveryAddress: Joi.string().required(),
  deliveryLat: Joi.number(),
  deliveryLng: Joi.number(),
  deliveryContact: Joi.string().required(),
  deliveryPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '请输入有效的手机号'
  }),
  distance: Joi.number().min(0).required(),
  weight: Joi.number().min(0),
  goodsValue: Joi.number().min(0),
  remark: Joi.string()
});

export const orderIdSchema = Joi.object({
  orderId: Joi.number().required()
});

export const cancelOrderSchema = Joi.object({
  orderId: Joi.number().required(),
  reason: Joi.string().min(1).required()
});

export const orderListSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).max(100).default(10),
  status: Joi.string().valid(...Object.values(OrderStatus)),
  keyword: Joi.string(),
  deliveryArea: Joi.string()
});

export const calculatePriceSchema = Joi.object({
  categoryId: Joi.number().required(),
  distance: Joi.number().min(0).required(),
  weight: Joi.number().min(0)
});
