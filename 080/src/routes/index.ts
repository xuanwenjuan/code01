import { Router } from 'express';
import {
  authenticate,
  requireRole,
  requireAdmin,
  requireOperatorOrAdmin,
  requireFinanceOrAdmin,
  requireSellerOrAdmin,
  canAccessCommission,
} from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { operationLog, Modules } from '../middlewares/operationLog';
import { OperationType } from '../models/OperationLog';
import { UserRole } from '../models';
import * as authController from '../controllers/authController';
import * as categoryController from '../controllers/categoryController';
import * as equipmentController from '../controllers/equipmentController';
import * as auctionController from '../controllers/auctionController';
import * as orderController from '../controllers/orderController';
import * as commissionController from '../controllers/commissionController';
import * as regionController from '../controllers/regionController';
import Joi from 'joi';

const router = Router();

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticate, authController.getCurrentUser);

router.get('/categories/tree', categoryController.getCategoryTree);
router.get('/categories/:id', categoryController.getCategoryById);
router.get('/categories', categoryController.getCategoryList);
router.post('/categories', authenticate, requireRole(UserRole.ADMIN), operationLog(Modules.CATEGORY, OperationType.CREATE, '创建分类'), categoryController.createCategory);
router.put('/categories/:id', authenticate, requireRole(UserRole.ADMIN), operationLog(Modules.CATEGORY, OperationType.UPDATE, '更新分类'), categoryController.updateCategory);
router.delete('/categories/:id', authenticate, requireRole(UserRole.ADMIN), operationLog(Modules.CATEGORY, OperationType.DELETE, '删除分类'), categoryController.deleteCategory);

router.get('/regions/tree', regionController.getRegionTree);
router.get('/regions/:id', regionController.getRegionById);
router.get('/regions', regionController.getRegionList);
router.get('/regions/:regionId/categories/linkage', regionController.getRegionCategoryLinkage);
router.get('/regions/:regionId/categories/:categoryId/equipments', regionController.getRegionCategoryEquipments);
router.post('/regions', authenticate, requireRole(UserRole.ADMIN), regionController.createRegion);
router.put('/regions/:id', authenticate, requireRole(UserRole.ADMIN), regionController.updateRegion);
router.delete('/regions/:id', authenticate, requireRole(UserRole.ADMIN), regionController.deleteRegion);

router.get('/equipments/my', authenticate, equipmentController.getMyEquipments);
router.get('/equipments/statistics', authenticate, equipmentController.getEquipmentStatistics);
router.get('/equipments', validateRequest(Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
})), equipmentController.getEquipmentList);
router.get('/equipments/:id/detail', equipmentController.getEquipmentDetail);
router.get('/equipments/:id', equipmentController.getEquipmentById);
router.post('/equipments', authenticate, requireRole(UserRole.SELLER, UserRole.ADMIN, UserRole.OPERATOR), operationLog(Modules.EQUIPMENT, OperationType.CREATE, '创建设备'), equipmentController.createEquipment);
router.put('/equipments/:id', authenticate, operationLog(Modules.EQUIPMENT, OperationType.UPDATE, '更新设备'), equipmentController.updateEquipment);
router.delete('/equipments/:id', authenticate, requireOperatorOrAdmin, operationLog(Modules.EQUIPMENT, OperationType.DELETE, '删除设备'), equipmentController.deleteEquipment);
router.put('/equipments/:id/status', authenticate, operationLog(Modules.EQUIPMENT, OperationType.STATUS_CHANGE, '更新设备状态'), equipmentController.updateEquipmentStatus);
router.put('/equipments/batch/status', authenticate, requireOperatorOrAdmin, operationLog(Modules.EQUIPMENT, OperationType.STATUS_CHANGE, '批量更新设备状态'), equipmentController.batchUpdateEquipmentStatus);

router.get('/auctions/my', authenticate, auctionController.getMyAuctions);
router.get('/auctions/statistics', authenticate, auctionController.getAuctionStatistics);
router.get('/auctions', auctionController.getAuctionList);
router.get('/auctions/:id/bids', auctionController.getAuctionBids);
router.get('/auctions/:id', auctionController.getAuctionById);
router.get('/my-bids', authenticate, auctionController.getMyBids);
router.post('/auctions', authenticate, requireRole(UserRole.SELLER, UserRole.ADMIN), operationLog(Modules.AUCTION, OperationType.CREATE, '创建竞拍'), auctionController.createAuction);
router.post('/auctions/:id/bid', authenticate, operationLog(Modules.AUCTION, OperationType.BID, '参与竞拍出价'), auctionController.placeBid);
router.post('/auctions/:id/end', authenticate, operationLog(Modules.AUCTION, OperationType.STATUS_CHANGE, '结束竞拍'), auctionController.endAuction);
router.post('/auctions/:id/cancel', authenticate, operationLog(Modules.AUCTION, OperationType.STATUS_CHANGE, '取消竞拍'), auctionController.cancelAuction);

router.get('/orders/buyer', authenticate, orderController.getBuyerOrders);
router.get('/orders/seller', authenticate, orderController.getSellerOrders);
router.get('/orders', authenticate, requireOperatorOrAdmin, orderController.getOrderList);
router.get('/orders/:id', authenticate, orderController.getOrderById);
router.post('/orders/:id/pay', authenticate, operationLog(Modules.ORDER, OperationType.PAYMENT, '支付订单'), orderController.payOrder);
router.post('/orders/:id/cancel', authenticate, operationLog(Modules.ORDER, OperationType.STATUS_CHANGE, '取消订单'), orderController.cancelOrder);
router.put('/orders/:id/status', authenticate, requireOperatorOrAdmin, operationLog(Modules.ORDER, OperationType.STATUS_CHANGE, '更新订单状态'), orderController.updateOrderStatus);

router.get('/commissions/summary', authenticate, requireSellerOrAdmin, commissionController.getSellerCommissionSummary);
router.get('/commissions/statistics', authenticate, canAccessCommission, commissionController.getCommissionStatistics);
router.get('/commissions/month/:month', authenticate, canAccessCommission, commissionController.getCommissionByMonth);
router.get('/commissions/category-report', authenticate, canAccessCommission, commissionController.getCategoryCommissionReport);
router.get('/commissions/:id', authenticate, canAccessCommission, commissionController.getCommissionById);
router.get('/commissions', authenticate, canAccessCommission, commissionController.getCommissionList);
router.post('/commissions/:id/settle', authenticate, requireFinanceOrAdmin, operationLog(Modules.COMMISSION, OperationType.STATUS_CHANGE, '佣金结算'), commissionController.settleCommission);
router.post('/commissions/batch/settle', authenticate, requireFinanceOrAdmin, operationLog(Modules.COMMISSION, OperationType.STATUS_CHANGE, '批量佣金结算'), commissionController.batchSettleCommissions);

export default router;
