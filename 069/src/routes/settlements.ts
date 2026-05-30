import express from 'express';
import Joi from 'joi';
import settlementController from '../controllers/settlementController';
import { authenticate, requireRole, UserRole } from '../middleware/auth';
import { validate, validateParams, validateQuery, commonValidators, idSchema, dateRangeSchema } from '../utils/validation';
import { operationLog } from '../middleware/operationLog';
import { SettlementStatus } from '../models/Settlement';

const router = express.Router();

const createSettlementSchema = Joi.object({
  type: Joi.string().valid('line', 'vehicle', 'branch').required().messages({
    'any.required': '结算类型不能为空',
    'any.only': '结算类型不正确'
  }),
  branchId: Joi.number().integer().when('type', {
    is: 'branch',
    then: Joi.required().messages({ 'any.required': '按网点结算需要指定网点ID' }),
    otherwise: Joi.optional()
  }),
  vehicleId: Joi.number().integer().when('type', {
    is: 'vehicle',
    then: Joi.required().messages({ 'any.required': '按车辆结算需要指定车辆ID' }),
    otherwise: Joi.optional()
  }),
  startDate: Joi.date().required().messages({
    'any.required': '开始日期不能为空'
  }),
  endDate: Joi.date().required().messages({
    'any.required': '结束日期不能为空'
  }),
  otherCosts: Joi.number().min(0).optional(),
  remark: Joi.string().optional()
});

const idSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': 'ID不能为空'
  })
});

const settlementListQuerySchema = Joi.object({
  type: Joi.string().valid('line', 'vehicle', 'branch').optional(),
  status: Joi.string().valid(...Object.values(SettlementStatus)).optional(),
  branchId: Joi.number().integer().optional(),
  vehicleId: Joi.number().integer().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  keyword: Joi.string().optional(),
  page: Joi.number().integer().min(1).optional(),
  pageSize: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().valid('createdAt', 'settlementNo', 'totalAmount').optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional()
});

const confirmSettlementSchema = Joi.object({
  remark: Joi.string().optional()
});

const cancelSettlementSchema = Joi.object({
  remark: Joi.string().required().messages({
    'any.required': '取消原因不能为空'
  })
});

const previewSettlementSchema = Joi.object({
  type: Joi.string().valid('line', 'vehicle', 'branch').required().messages({
    'any.required': '结算类型不能为空',
    'any.only': '结算类型不正确'
  }),
  branchId: Joi.number().integer().when('type', {
    is: 'branch',
    then: Joi.required().messages({ 'any.required': '按网点结算需要指定网点ID' }),
    otherwise: Joi.optional()
  }),
  vehicleId: Joi.number().integer().when('type', {
    is: 'vehicle',
    then: Joi.required().messages({ 'any.required': '按车辆结算需要指定车辆ID' }),
    otherwise: Joi.optional()
  }),
  startDate: Joi.date().required().messages({
    'any.required': '开始日期不能为空'
  }),
  endDate: Joi.date().required().messages({
    'any.required': '结束日期不能为空'
  }),
  otherCosts: Joi.number().min(0).optional()
});

const statisticsQuerySchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  type: Joi.string().valid('line', 'vehicle', 'branch').optional(),
  branchId: Joi.number().integer().optional(),
  vehicleId: Joi.number().integer().optional()
});

router.use(authenticate);

router.get('/statistics', validateQuery(statisticsQuerySchema), settlementController.getSettlementStatistics);
router.get('/:id/items', validateParams(idSchema), settlementController.getSettlementItems);

router.post(
  '/preview',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCE),
  validate(previewSettlementSchema),
  settlementController.previewSettlement
);

router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCE),
  operationLog('结算管理', '创建结算单'),
  validate(createSettlementSchema),
  settlementController.createSettlement
);

router.get(
  '/:id',
  validateParams(idSchema),
  settlementController.getSettlementById
);

router.get(
  '/',
  validateQuery(settlementListQuerySchema),
  settlementController.getSettlementList
);

router.patch(
  '/:id/confirm',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCE),
  operationLog('结算管理', '确认结算'),
  validateParams(idSchema),
  validate(confirmSettlementSchema),
  settlementController.confirmSettlement
);

router.patch(
  '/:id/cancel',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCE),
  operationLog('结算管理', '取消结算'),
  validateParams(idSchema),
  validate(cancelSettlementSchema),
  settlementController.cancelSettlement
);

export default router;
