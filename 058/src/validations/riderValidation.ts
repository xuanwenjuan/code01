import Joi from 'joi';
import { RiderStatus } from '../types';

export const applyRiderSchema = Joi.object({
  realName: Joi.string().min(2).max(50).required(),
  idCard: Joi.string().pattern(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/).required().messages({
    'string.pattern.base': '请输入有效的身份证号'
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '请输入有效的手机号'
  }),
  vehicleType: Joi.string().required(),
  idCardFront: Joi.string().required(),
  idCardBack: Joi.string().required(),
  vehicleNumber: Joi.string(),
  deliveryArea: Joi.string()
});

export const auditRiderSchema = Joi.object({
  riderId: Joi.number().required(),
  status: Joi.string().valid(RiderStatus.APPROVED, RiderStatus.REJECTED).required(),
  remark: Joi.string()
});

export const updateRiderStatusSchema = Joi.object({
  riderId: Joi.number().required(),
  status: Joi.string().valid(...Object.values(RiderStatus)).required()
});

export const updateRiderInfoSchema = Joi.object({
  riderId: Joi.number().required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).messages({
    'string.pattern.base': '请输入有效的手机号'
  }),
  vehicleType: Joi.string(),
  vehicleNumber: Joi.string(),
  deliveryArea: Joi.string()
});

export const receiveOrderPermissionSchema = Joi.object({
  riderId: Joi.number().required(),
  canReceiveOrder: Joi.boolean().required()
});

export const riderListSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).max(100).default(10),
  status: Joi.string().valid(...Object.values(RiderStatus)),
  keyword: Joi.string()
});
