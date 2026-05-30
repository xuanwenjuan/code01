import express from 'express';
import Joi from 'joi';
import orderController from '../controllers/orderController';
import { authenticate, requireRole, UserRole, requirePermission } from '../middleware/auth';
import { validate, validateParams, validateQuery, commonValidators, idSchema } from '../utils/validation';
import { operationLog } from '../middleware/operationLog';
import { OrderStatus } from '../models/Order';

const router = express.Router();

const createOrderSchema = Joi.object({
  shipperName: Joi.string().required().max(50).messages({
    'any.required': '发货人姓名不能为空'
  }),
  shipperPhone: Joi.string().required().max(20).messages({
    'any.required': '发货人电话不能为空'
  }),
  shipperAddress: Joi.string().required().max(255).messages({
    'any.required': '发货人地址不能为空'
  }),
  shipperBranchId: Joi.number().integer().optional(),
  receiverName: Joi.string().required().max(50).messages({
    'any.required': '收货人姓名不能为空'
  }),
  receiverPhone: Joi.string().required().max(20).messages({
    'any.required': '收货人电话不能为空'
  }),
  receiverAddress: Joi.string().required().max(255).messages({
    'any.required': '收货人地址不能为空'
  }),
  receiverBranchId: Joi.number().integer().optional(),
  goodsName: Joi.string().required().max(100).messages({
    'any.required': '货物名称不能为空'
  }),
  goodsWeight: Joi.number().positive().required().messages({
    'any.required': '货物重量不能为空',
    'number.positive': '货物重量必须大于0'
  }),
  goodsVolume: Joi.number().positive().optional(),
  goodsQuantity: Joi.number().integer().positive().required().messages({
    'any.required': '货物数量不能为空',
    'number.positive': '货物数量必须大于0'
  }),
  freightAmount: Joi.number().positive().required().messages({
    'any.required': '运费金额不能为空',
    'number.positive': '运费金额必须大于0'
  }),
  insuranceAmount: Joi.number().positive().optional(),
  totalAmount: Joi.number().positive().required().messages({
    'any.required': '总金额不能为空',
    'number.positive': '总金额必须大于0'
  }),
  paymentMethod: Joi.string().required().max(20).messages({
    'any.required': '付款方式不能为空'
  }),
  vehicleId: Joi.number().integer().optional(),
  remark: Joi.string().optional()
});

const updateOrderSchema = Joi.object({
  shipperName: Joi.string().max(50).optional(),
  shipperPhone: Joi.string().max(20).optional(),
  shipperAddress: Joi.string().max(255).optional(),
  shipperBranchId: Joi.number().integer().optional(),
  receiverName: Joi.string().max(50).optional(),
  receiverPhone: Joi.string().max(20).optional(),
  receiverAddress: Joi.string().max(255).optional(),
  receiverBranchId: Joi.number().integer().optional(),
  goodsName: Joi.string().max(100).optional(),
  goodsWeight: Joi.number().positive().optional(),
  goodsVolume: Joi.number().positive().optional(),
  goodsQuantity: Joi.number().integer().positive().optional(),
  freightAmount: Joi.number().positive().optional(),
  insuranceAmount: Joi.number().positive().optional(),
  totalAmount: Joi.number().positive().optional(),
  paymentMethod: Joi.string().max(20).optional(),
  vehicleId: Joi.number().integer().optional(),
  remark: Joi.string().optional()
});

const idSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': 'ID不能为空'
  })
});

const orderListQuerySchema = Joi.object({
  status: Joi.string().valid(...Object.values(OrderStatus)).optional(),
  shipperBranchId: Joi.number().integer().optional(),
  receiverBranchId: Joi.number().integer().optional(),
  vehicleId: Joi.number().integer().optional(),
  keyword: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().integer().min(1).optional(),
  pageSize: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'orderNo', 'totalAmount').optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional()
});

const remarkSchema = Joi.object({
  remark: Joi.string().optional(),
  vehicleId: Joi.number().integer().optional()
});

const vehicleIdSchema = Joi.object({
  vehicleId: Joi.number().integer().required().messages({
    'any.required': '车辆ID不能为空'
  }),
  remark: Joi.string().optional()
});

const transferOrderSchema = Joi.object({
  currentBranchId: Joi.number().integer().required().messages({
    'any.required': '中转网点ID不能为空'
  }),
  remark: Joi.string().optional()
});

const markAbnormalSchema = Joi.object({
  remark: Joi.string().required().messages({
    'any.required': '异常原因不能为空'
  })
});

const resolveAbnormalSchema = Joi.object({
  targetStatus: Joi.string().valid(OrderStatus.PENDING, OrderStatus.CANCELLED, OrderStatus.IN_TRANSIT).required().messages({
    'any.required': '目标状态不能为空'
  }),
  remark: Joi.string().required().messages({
    'any.required': '处理说明不能为空'
  }),
  vehicleId: Joi.number().integer().optional()
});

const cancelOrderSchema = Joi.object({
  remark: Joi.string().required().messages({
    'any.required': '取消原因不能为空'
  })
});

const statisticsQuerySchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  branchId: Joi.number().integer().optional(),
  vehicleId: Joi.number().integer().optional()
});

router.use(authenticate);

router.get('/statistics', validateQuery(statisticsQuerySchema), orderController.getOrderStatistics);
router.get('/:id/logs', validateParams(idSchema), orderController.getOrderLogs);

router.post(
  '/',
  operationLog('订单管理', '创建订单'),
  validate(createOrderSchema),
  orderController.createOrder
);

router.put(
  '/:id',
  requireRole('admin', 'manager', 'dispatcher'),
  operationLog('订单管理', '更新订单'),
  validateParams(idSchema),
  validate(updateOrderSchema),
  orderController.updateOrder
);

router.get(
  '/:id',
  validateParams(idSchema),
  orderController.getOrderById
);

router.get(
  '/',
  validateQuery(orderListQuerySchema),
  orderController.getOrderList
);

router.patch(
  '/:id/pickup',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER),
  operationLog('订单管理', '揽收订单'),
  validateParams(idSchema),
  validate(remarkSchema),
  orderController.pickupOrder
);

router.patch(
  '/:id/transit',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER),
  operationLog('订单管理', '开始运输'),
  validateParams(idSchema),
  validate(vehicleIdSchema),
  orderController.startTransit
);

router.patch(
  '/:id/transfer',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER),
  operationLog('订单管理', '中转分拨'),
  validateParams(idSchema),
  validate(transferOrderSchema),
  orderController.transferOrder
);

router.patch(
  '/:id/delivery',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER),
  operationLog('订单管理', '开始派送'),
  validateParams(idSchema),
  validate(remarkSchema),
  orderController.startDelivery
);

router.patch(
  '/:id/sign',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER),
  operationLog('订单管理', '签收订单'),
  validateParams(idSchema),
  validate(remarkSchema),
  orderController.signOrder
);

router.patch(
  '/:id/abnormal',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER),
  operationLog('订单管理', '标记异常'),
  validateParams(idSchema),
  validate(markAbnormalSchema),
  orderController.markAbnormal
);

router.patch(
  '/:id/abnormal/resolve',
  requireRole(UserRole.ADMIN, UserRole.MANAGER),
  operationLog('订单管理', '处理异常'),
  validateParams(idSchema),
  validate(resolveAbnormalSchema),
  orderController.resolveAbnormal
);

router.patch(
  '/:id/cancel',
  requireRole(UserRole.ADMIN, UserRole.MANAGER),
  operationLog('订单管理', '取消订单'),
  validateParams(idSchema),
  validate(cancelOrderSchema),
  orderController.cancelOrder
);

router.post(
  '/auto-transition',
  requireRole(UserRole.ADMIN),
  operationLog('订单管理', '自动状态流转'),
  orderController.autoTransitionStatus
);

export default router;
