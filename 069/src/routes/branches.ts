import express from 'express';
import Joi from 'joi';
import branchController from '../controllers/branchController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, validateParams, validateQuery } from '../utils/validation';
import { operationLog } from '../middleware/operationLog';
import { BranchType, BranchStatus } from '../models/Branch';

const router = express.Router();

const createBranchSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'any.required': '网点名称不能为空',
    'string.max': '网点名称不能超过100个字符'
  }),
  code: Joi.string().required().max(50).messages({
    'any.required': '网点编码不能为空',
    'string.max': '网点编码不能超过50个字符'
  }),
  type: Joi.string().valid(...Object.values(BranchType)).required().messages({
    'any.required': '网点类型不能为空',
    'any.only': '网点类型不正确'
  }),
  parentId: Joi.number().integer().optional(),
  address: Joi.string().required().max(255).messages({
    'any.required': '地址不能为空'
  }),
  province: Joi.string().required().max(50).messages({
    'any.required': '省份不能为空'
  }),
  city: Joi.string().required().max(50).messages({
    'any.required': '城市不能为空'
  }),
  district: Joi.string().max(50).optional(),
  contactPerson: Joi.string().required().max(50).messages({
    'any.required': '联系人不能为空'
  }),
  contactPhone: Joi.string().required().max(20).messages({
    'any.required': '联系电话不能为空'
  }),
  sortOrder: Joi.number().integer().optional(),
  remark: Joi.string().optional()
});

const updateBranchSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  code: Joi.string().max(50).optional(),
  type: Joi.string().valid(...Object.values(BranchType)).optional(),
  parentId: Joi.number().integer().optional().allow(null),
  address: Joi.string().max(255).optional(),
  province: Joi.string().max(50).optional(),
  city: Joi.string().max(50).optional(),
  district: Joi.string().max(50).optional(),
  contactPerson: Joi.string().max(50).optional(),
  contactPhone: Joi.string().max(20).optional(),
  status: Joi.string().valid(...Object.values(BranchStatus)).optional(),
  sortOrder: Joi.number().integer().optional(),
  remark: Joi.string().optional()
});

const idSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': 'ID不能为空'
  })
});

const branchListQuerySchema = Joi.object({
  type: Joi.string().valid(...Object.values(BranchType)).optional(),
  status: Joi.string().valid(...Object.values(BranchStatus)).optional(),
  keyword: Joi.string().optional(),
  page: Joi.number().integer().min(1).optional(),
  pageSize: Joi.number().integer().min(1).max(100).optional(),
  includeChildren: Joi.boolean().optional()
});

const branchTreeQuerySchema = Joi.object({
  type: Joi.string().valid(...Object.values(BranchType)).optional(),
  status: Joi.string().valid(...Object.values(BranchStatus)).optional(),
  parentId: Joi.number().integer().optional(),
  keyword: Joi.string().optional(),
  includeInactive: Joi.boolean().optional()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(BranchStatus)).required().messages({
    'any.required': '状态不能为空'
  }),
  remark: Joi.string().optional()
});

const bindParentSchema = Joi.object({
  parentId: Joi.number().integer().required().messages({
    'any.required': '上级网点ID不能为空'
  })
});

router.use(authenticate);

router.get('/tree', validateQuery(branchTreeQuerySchema), branchController.getBranchTree);
router.get('/:id/stats', validateParams(idSchema), branchController.getBranchStats);

router.post(
  '/',
  requireRole('admin', 'manager'),
  operationLog('网点管理', '创建网点'),
  validate(createBranchSchema),
  branchController.createBranch
);

router.put(
  '/:id',
  requireRole('admin', 'manager'),
  operationLog('网点管理', '更新网点'),
  validateParams(idSchema),
  validate(updateBranchSchema),
  branchController.updateBranch
);

router.delete(
  '/:id',
  requireRole('admin'),
  operationLog('网点管理', '删除网点'),
  validateParams(idSchema),
  branchController.deleteBranch
);

router.get(
  '/:id',
  validateParams(idSchema),
  branchController.getBranchById
);

router.get(
  '/',
  validateQuery(branchListQuerySchema),
  branchController.getBranchList
);

router.patch(
  '/:id/status',
  requireRole('admin', 'manager'),
  operationLog('网点管理', '更新网点状态'),
  validateParams(idSchema),
  validate(updateStatusSchema),
  branchController.updateBranchStatus
);

router.patch(
  '/:id/parent',
  requireRole('admin', 'manager'),
  operationLog('网点管理', '绑定上级网点'),
  validateParams(idSchema),
  validate(bindParentSchema),
  branchController.bindParentBranch
);

export default router;
