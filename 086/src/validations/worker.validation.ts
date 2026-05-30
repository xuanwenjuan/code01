import Joi from 'joi';
import { WorkerStatus } from '../types';

export const createWorkerSchema = Joi.object({
  body: Joi.object({
    userId: Joi.string().uuid().required().messages({
      'string.uuid': '用户ID格式无效',
      'any.required': '用户ID不能为空'
    }),
    skills: Joi.array().items(Joi.string()).min(1).required().messages({
      'array.min': '至少选择一个擅长工种',
      'any.required': '擅长工种不能为空'
    }),
    serviceAreas: Joi.array().items(Joi.string()).min(1).required().messages({
      'array.min': '至少选择一个服务区域',
      'any.required': '服务区域不能为空'
    }),
    serviceLevel: Joi.number().integer().min(1).max(5).optional(),
    idCardFront: Joi.string().uri().optional(),
    idCardBack: Joi.string().uri().optional(),
    healthCertificate: Joi.string().uri().optional(),
    healthCertExpire: Joi.date().iso().optional(),
    qualification: Joi.string().max(1000).optional(),
    bankAccount: Joi.string().max(50).optional(),
    bankName: Joi.string().max(100).optional(),
    dailyOrderLimit: Joi.number().integer().min(1).default(5)
  })
});

export const updateWorkerSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required()
  }),
  body: Joi.object({
    skills: Joi.array().items(Joi.string()).min(1).optional(),
    serviceAreas: Joi.array().items(Joi.string()).min(1).optional(),
    serviceLevel: Joi.number().integer().min(1).max(5).optional(),
    status: Joi.string().valid(...Object.values(WorkerStatus)).optional(),
    idCardFront: Joi.string().uri().optional(),
    idCardBack: Joi.string().uri().optional(),
    healthCertificate: Joi.string().uri().optional(),
    healthCertExpire: Joi.date().iso().optional(),
    qualification: Joi.string().max(1000).optional(),
    bankAccount: Joi.string().max(50).optional(),
    bankName: Joi.string().max(100).optional(),
    dailyOrderLimit: Joi.number().integer().min(1).optional()
  })
});

export const updateWorkerStatusSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required()
  }),
  body: Joi.object({
    status: Joi.string().valid(...Object.values(WorkerStatus)).required().messages({
      'any.required': '状态不能为空',
      'any.only': '无效的师傅状态'
    })
  })
});

export const getWorkerListSchema = Joi.object({
  query: Joi.object({
    status: Joi.string().valid(...Object.values(WorkerStatus)).optional(),
    skill: Joi.string().optional(),
    serviceArea: Joi.string().optional(),
    keyword: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10)
  })
});
