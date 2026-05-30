import Joi from 'joi';
import { GroupBuyStatus } from '../models/GroupBuy.model';

export const createGroupBuySchema = Joi.object({
  body: Joi.object({
    title: Joi.string().required().max(200),
    productId: Joi.number().integer().required(),
    leaderId: Joi.number().integer().required(),
    minQuantity: Joi.number().integer().min(1).default(10),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    pickupAddress: Joi.string().required().max(255),
    pickupTime: Joi.date().optional(),
    remark: Joi.string().optional()
  })
});

export const updateGroupBuySchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  }),
  body: Joi.object({
    title: Joi.string().max(200).optional(),
    productId: Joi.number().integer().optional(),
    minQuantity: Joi.number().integer().min(1).optional(),
    startTime: Joi.date().optional(),
    endTime: Joi.date().optional(),
    pickupAddress: Joi.string().max(255).optional(),
    pickupTime: Joi.date().optional(),
    remark: Joi.string().optional().allow(''),
    status: Joi.string().valid(...Object.values(GroupBuyStatus)).optional()
  }).min(1)
});

export const getGroupBuySchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  })
});
