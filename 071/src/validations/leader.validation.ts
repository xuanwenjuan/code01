import Joi from 'joi';
import { LeaderStatus } from '../models/Leader.model';

export const createLeaderSchema = Joi.object({
  body: Joi.object({
    userId: Joi.number().integer().required(),
    communityName: Joi.string().required().max(100),
    address: Joi.string().required().max(255),
    province: Joi.string().required().max(50),
    city: Joi.string().required().max(50),
    district: Joi.string().required().max(50),
    buildingCoverage: Joi.string().required(),
    phone: Joi.string().required().pattern(/^1[3-9]\d{9}$/),
    wechat: Joi.string().optional(),
    idCard: Joi.string().optional().pattern(/^\d{17}[\dXx]$/),
    idCardFront: Joi.string().uri().optional(),
    idCardBack: Joi.string().uri().optional(),
    commissionRate: Joi.number().min(0).max(100).default(10)
  })
});

export const updateLeaderSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  }),
  body: Joi.object({
    communityName: Joi.string().max(100).optional(),
    address: Joi.string().max(255).optional(),
    province: Joi.string().max(50).optional(),
    city: Joi.string().max(50).optional(),
    district: Joi.string().max(50).optional(),
    buildingCoverage: Joi.string().optional(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
    wechat: Joi.string().optional().allow(''),
    idCard: Joi.string().pattern(/^\d{17}[\dXx]$/).optional(),
    idCardFront: Joi.string().uri().optional().allow(''),
    idCardBack: Joi.string().uri().optional().allow(''),
    commissionRate: Joi.number().min(0).max(100).optional(),
    status: Joi.string().valid(...Object.values(LeaderStatus)).optional()
  }).min(1)
});

export const auditLeaderSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  }),
  body: Joi.object({
    status: Joi.string().valid(LeaderStatus.NORMAL, LeaderStatus.BANNED).required(),
    auditRemark: Joi.string().optional().max(255)
  })
});

export const getLeaderSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required()
  })
});
