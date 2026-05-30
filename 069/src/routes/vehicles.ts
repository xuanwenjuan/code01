import express from 'express';
import Joi from 'joi';
import vehicleController from '../controllers/vehicleController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, validateParams, validateQuery } from '../utils/validation';
import { operationLog } from '../middleware/operationLog';
import { VehicleStatus } from '../models/Vehicle';

const router = express.Router();

const createVehicleSchema = Joi.object({
  plateNumber: Joi.string().required().max(20).messages({
    'any.required': '车牌号不能为空'
  }),
  vehicleType: Joi.string().required().max(50).messages({
    'any.required': '车型不能为空'
  }),
  loadCapacity: Joi.number().positive().required().messages({
    'any.required': '载重不能为空',
    'number.positive': '载重必须大于0'
  }),
  loadVolume: Joi.number().positive().optional(),
  driverName: Joi.string().required().max(50).messages({
    'any.required': '司机姓名不能为空'
  }),
  driverPhone: Joi.string().required().max(20).messages({
    'any.required': '司机电话不能为空'
  }),
  driverIdCard: Joi.string().max(20).optional(),
  operatingLicense: Joi.string().required().max(50).messages({
    'any.required': '营运证号不能为空'
  }),
  licenseExpireDate: Joi.date().required().messages({
    'any.required': '证件到期日期不能为空'
  }),
  branchId: Joi.number().integer().required().messages({
    'any.required': '所属网点不能为空'
  }),
  currentLocation: Joi.string().max(200).optional(),
  remark: Joi.string().optional()
});

const updateVehicleSchema = Joi.object({
  plateNumber: Joi.string().max(20).optional(),
  vehicleType: Joi.string().max(50).optional(),
  loadCapacity: Joi.number().positive().optional(),
  loadVolume: Joi.number().positive().optional(),
  driverName: Joi.string().max(50).optional(),
  driverPhone: Joi.string().max(20).optional(),
  driverIdCard: Joi.string().max(20).optional(),
  operatingLicense: Joi.string().max(50).optional(),
  licenseExpireDate: Joi.date().optional(),
  branchId: Joi.number().integer().optional(),
  status: Joi.string().valid(...Object.values(VehicleStatus)).optional(),
  currentLocation: Joi.string().max(200).optional(),
  remark: Joi.string().optional()
});

const idSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': 'ID不能为空'
  })
});

const vehicleListQuerySchema = Joi.object({
  branchId: Joi.number().integer().optional(),
  status: Joi.string().valid(...Object.values(VehicleStatus)).optional(),
  vehicleType: Joi.string().optional(),
  vehicleTypes: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  minLoadCapacity: Joi.number().min(0).optional(),
  maxLoadCapacity: Joi.number().min(0).optional(),
  minLoadVolume: Joi.number().min(0).optional(),
  maxLoadVolume: Joi.number().min(0).optional(),
  keyword: Joi.string().optional(),
  page: Joi.number().integer().min(1).optional(),
  pageSize: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().valid('createdAt', 'licenseExpireDate', 'loadCapacity', 'loadVolume', 'plateNumber').optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(VehicleStatus)).required().messages({
    'any.required': '状态不能为空'
  }),
  remark: Joi.string().optional()
});

const bindBranchSchema = Joi.object({
  branchId: Joi.number().integer().required().messages({
    'any.required': '网点ID不能为空'
  })
});

const expiringQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).optional()
});

const availableVehiclesQuerySchema = Joi.object({
  branchId: Joi.number().integer().optional(),
  minCapacity: Joi.number().positive().optional(),
  maxCapacity: Joi.number().positive().optional()
});

const statsQuerySchema = Joi.object({
  branchId: Joi.number().integer().optional()
});

router.use(authenticate);

router.get('/expiring', requireRole('admin', 'manager'), validateQuery(expiringQuerySchema), vehicleController.getExpiringVehicles);
router.get('/available', validateQuery(availableVehiclesQuerySchema), vehicleController.getAvailableVehicles);
router.get('/stats', validateQuery(statsQuerySchema), vehicleController.getVehicleStats);

router.post(
  '/',
  requireRole('admin', 'manager'),
  operationLog('车辆管理', '创建车辆'),
  validate(createVehicleSchema),
  vehicleController.createVehicle
);

router.put(
  '/:id',
  requireRole('admin', 'manager'),
  operationLog('车辆管理', '更新车辆'),
  validateParams(idSchema),
  validate(updateVehicleSchema),
  vehicleController.updateVehicle
);

router.delete(
  '/:id',
  requireRole('admin'),
  operationLog('车辆管理', '删除车辆'),
  validateParams(idSchema),
  vehicleController.deleteVehicle
);

router.get(
  '/:id',
  validateParams(idSchema),
  vehicleController.getVehicleById
);

router.get(
  '/',
  validateQuery(vehicleListQuerySchema),
  vehicleController.getVehicleList
);

router.patch(
  '/:id/status',
  requireRole('admin', 'manager', 'dispatcher'),
  operationLog('车辆管理', '更新车辆状态'),
  validateParams(idSchema),
  validate(updateStatusSchema),
  vehicleController.updateVehicleStatus
);

router.patch(
  '/:id/branch',
  requireRole('admin', 'manager'),
  operationLog('车辆管理', '绑定网点'),
  validateParams(idSchema),
  validate(bindBranchSchema),
  vehicleController.bindBranch
);

export default router;
