import Joi from 'joi';
import { OrderStatus } from '../models/Order.model';

export const createOrderSchema = Joi.object({
  body: Joi.object({
    userId: Joi.number().integer().required(),
    leaderId: Joi.number().integer().required(),
    groupBuyId: Joi.number().integer().required(),
    productId: Joi.number().integer().required(),
    productName: Joi.string().required().max(100),
    productImage: Joi.string().uri().optional(),
    specs: Joi.string().optional(),
    quantity: Joi.number().integer().min(1).required(),
    unitPrice: Joi.number().min(0).required(),
    receiverName: Joi.string().required().max(50),
    receiverPhone: Joi.string().required().pattern(/^1[3-9]\d{9}$/),
    pickupAddress: Joi.string().required().max(255),
    remark: Joi.string().optional()
  })
});

export const updateOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  }),
  body: Joi.object({
    receiverName: Joi.string().max(50).optional(),
    receiverPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
    pickupAddress: Joi.string().max(255).optional(),
    remark: Joi.string().optional().allow(''),
    status: Joi.string().valid(...Object.values(OrderStatus)).optional()
  }).min(1)
});

export const getOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  })
});

export const updateOrderStatusSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  }),
  body: Joi.object({
    status: Joi.string().valid(...Object.values(OrderStatus)).required(),
    cancelReason: Joi.string().optional().max(255)
  })
});
