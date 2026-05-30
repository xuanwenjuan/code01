import { Router } from 'express';
import { authenticate, requireAdmin, requireMerchant, requireInfluencer, requireOperator, requireFinance } from '../middleware/auth';
import * as authController from '../controllers/auth.controller';
import * as categoryController from '../controllers/category.controller';
import * as influencerController from '../controllers/influencer.controller';
import * as orderController from '../controllers/order.controller';
import * as settlementController from '../controllers/settlement.controller';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '自媒体达人接单平台服务运行正常' });
});

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticate, authController.getCurrentUser);
router.put('/auth/password', authenticate, authController.changePassword);

router.get('/categories/tree', categoryController.getCategoryTree);
router.get('/categories', categoryController.getCategoryList);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', authenticate, requireAdmin, categoryController.createCategory);
router.put('/categories/:id', authenticate, requireAdmin, categoryController.updateCategory);
router.delete('/categories/:id', authenticate, requireAdmin, categoryController.deleteCategory);
router.put('/categories/:id/pause', authenticate, requireAdmin, categoryController.pauseCategory);
router.put('/categories/:id/activate', authenticate, requireAdmin, categoryController.activateCategory);

router.get('/influencers', influencerController.getInfluencerList);
router.get('/influencers/me', authenticate, requireInfluencer, influencerController.getMyProfile);
router.get('/influencers/:id', influencerController.getInfluencerById);
router.post('/influencers', authenticate, requireInfluencer, influencerController.createInfluencer);
router.put('/influencers/:id', authenticate, influencerController.updateInfluencer);
router.put('/influencers/:id/review', authenticate, requireAdmin, influencerController.reviewInfluencer);
router.put('/influencers/tags', authenticate, requireInfluencer, influencerController.updateTags);

router.get('/orders', authenticate, orderController.getOrderList);
router.get('/orders/:id', authenticate, orderController.getOrderById);
router.post('/orders', authenticate, requireMerchant, orderController.createOrder);
router.put('/orders/:id', authenticate, orderController.updateOrder);
router.put('/orders/:id/status', authenticate, orderController.updateOrderStatus);
router.put('/orders/:id/match', authenticate, requireAdmin, orderController.matchInfluencer);
router.put('/orders/:id/cancel', authenticate, orderController.cancelOrder);
router.put('/orders/:id/submit', authenticate, requireInfluencer, orderController.submitVideo);

router.get('/settlements', authenticate, settlementController.getSettlementList);
router.get('/settlements/statistics', authenticate, settlementController.getStatistics);
router.get('/settlements/:id', authenticate, settlementController.getSettlementById);
router.post('/settlements/order/:orderId', authenticate, requireFinance, settlementController.createSettlementByOrderId);
router.put('/settlements/:id/process', authenticate, requireFinance, settlementController.processSettlement);
router.put('/settlements/:id/complete', authenticate, requireFinance, settlementController.completeSettlement);
router.put('/settlements/batch-process', authenticate, requireFinance, settlementController.batchProcessSettlements);

export default router;
