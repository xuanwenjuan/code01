import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { OrderStatus, WorkerStatus, SettlementStatus, UserRole } from '../types';
import { ResponseUtil } from '../utils/response';

const idSchema = Joi.string().uuid().required().messages({
  'string.base': 'ID必须是字符串',
  'string.guid': 'ID格式不正确',
  'any.required': 'ID是必填项'
});

const pageSchema = {
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10)
};

const workerFilterSchema = Joi.object({
  status: Joi.string().valid(...Object.values(WorkerStatus)),
  skills: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  serviceAreas: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  keyword: Joi.string().max(100),
  ratingMin: Joi.number().min(0).max(5),
  ratingMax: Joi.number().min(0).max(5),
  serviceDate: Joi.string().isoDate(),
  serviceTime: Joi.string(),
  ...pageSchema
});

const createWorkerSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  skills: Joi.array().items(Joi.string()).min(1).required(),
  serviceAreas: Joi.array().items(Joi.string()).min(1).required(),
  description: Joi.string().max(500),
  idCard: Joi.string().pattern(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/),
  idCardImage: Joi.string().uri(),
  healthCertificate: Joi.string(),
  healthCertificateExpiry: Joi.date(),
  workExperience: Joi.number().integer().min(0),
  basePrice: Joi.number().positive()
});

const updateWorkerSchema = Joi.object({
  skills: Joi.array().items(Joi.string()).min(1),
  serviceAreas: Joi.array().items(Joi.string()).min(1),
  description: Joi.string().max(500),
  idCard: Joi.string().pattern(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/),
  idCardImage: Joi.string().uri(),
  healthCertificate: Joi.string(),
  healthCertificateExpiry: Joi.date(),
  workExperience: Joi.number().integer().min(0),
  basePrice: Joi.number().positive(),
  avatar: Joi.string().uri()
});

const updateWorkerStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(WorkerStatus)).required()
});

const createOrderSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  serviceCategoryId: Joi.string().uuid().required(),
  serviceAddress: Joi.string().required().max(500),
  serviceCity: Joi.string().required().max(100),
  scheduledDate: Joi.date().required(),
  scheduledTime: Joi.string().max(20),
  contactName: Joi.string().required().max(100),
  contactPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
  description: Joi.string().max(1000),
  serviceFee: Joi.number().positive().required()
});

const assignOrderSchema = Joi.object({
  workerId: Joi.string().uuid().required()
});

const cancelOrderSchema = Joi.object({
  cancelReason: Joi.string().required().max(500)
});

const orderFilterSchema = Joi.object({
  userId: Joi.string().uuid(),
  workerId: Joi.string().uuid(),
  status: Joi.string().valid(...Object.values(OrderStatus)),
  serviceArea: Joi.string().max(100),
  startDate: Joi.date(),
  endDate: Joi.date(),
  ...pageSchema
});

const createCategorySchema = Joi.object({
  name: Joi.string().required().max(100),
  description: Joi.string().max(500),
  parentId: Joi.string().uuid().allow(null),
  icon: Joi.string().uri(),
  sortOrder: Joi.number().integer().min(0).default(0),
  basePrice: Joi.number().positive(),
  unit: Joi.string().max(20)
});

const updateCategorySchema = Joi.object({
  name: Joi.string().max(100),
  description: Joi.string().max(500),
  parentId: Joi.string().uuid().allow(null),
  icon: Joi.string().uri(),
  sortOrder: Joi.number().integer().min(0),
  basePrice: Joi.number().positive(),
  unit: Joi.string().max(20)
});

const categoryFilterSchema = Joi.object({
  parentId: Joi.string().uuid().allow(null),
  status: Joi.string().valid('active', 'inactive'),
  ...pageSchema
});

const settlementFilterSchema = Joi.object({
  workerId: Joi.string().uuid(),
  status: Joi.string().valid(...Object.values(SettlementStatus)),
  startDate: Joi.date(),
  endDate: Joi.date(),
  ...pageSchema
});

const withdrawSchema = Joi.object({
  settlementIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
  withdrawTransactionId: Joi.string()
});

const settleAllSchema = Joi.object({
  workerId: Joi.string().uuid().required()
});

const validate = (schema: Joi.ObjectSchema, location: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = location === 'params' ? req.params : location === 'query' ? req.query : req.body;
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      convert: true,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return ResponseUtil.validationError(res, '参数验证失败', errors);
    }

    if (location === 'body') {
      req.body = value;
    } else if (location === 'query') {
      req.query = value;
    }

    next();
  };
};

const validateParams = () => validate(Joi.object({ id: idSchema }), 'params');
const validateOrderId = () => validate(Joi.object({ orderId: idSchema }), 'params');
const validateUserId = () => validate(Joi.object({ userId: idSchema }), 'params');
const validateWorkerId = () => validate(Joi.object({ workerId: idSchema }), 'params');

export const ValidationSchemas = {
  id: idSchema,
  workerFilter: workerFilterSchema,
  createWorker: createWorkerSchema,
  updateWorker: updateWorkerSchema,
  updateWorkerStatus: updateWorkerStatusSchema,
  createOrder: createOrderSchema,
  assignOrder: assignOrderSchema,
  cancelOrder: cancelOrderSchema,
  orderFilter: orderFilterSchema,
  createCategory: createCategorySchema,
  updateCategory: updateCategorySchema,
  categoryFilter: categoryFilterSchema,
  settlementFilter: settlementFilterSchema,
  withdraw: withdrawSchema,
  settleAll: settleAllSchema
};

export const ValidationMiddleware = {
  validate,
  validateParams,
  validateOrderId,
  validateUserId,
  validateWorkerId,
  validateBody: (schema: Joi.ObjectSchema) => validate(schema, 'body'),
  validateQuery: (schema: Joi.ObjectSchema) => validate(schema, 'query')
};

export default ValidationMiddleware;
