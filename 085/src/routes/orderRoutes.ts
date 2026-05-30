import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  payOrder,
  shipOrder,
  receiveOrder,
  cancelOrder,
  getAllOrders,
  getArtistOrders,
  getOrderStatistics
} from '../controllers/orderController';
import { authenticate, requireAdmin, requireMerchant } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { validate, schemas } from '../middleware/validate';

const router = express.Router();

router.use(authenticate);
router.post('/', validate(schemas.order.create, 'body'), operationLog('order', '创建订单'), createOrder);
router.get('/my', validate(schemas.order.getList, 'query'), getOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', validate(schemas.order.pay, 'body'), operationLog('order', '支付订单'), payOrder);
router.put('/:id/receive', operationLog('order', '确认收货'), receiveOrder);
router.put('/:id/cancel', validate(schemas.order.cancel, 'body'), operationLog('order', '取消订单'), cancelOrder);

router.use(requireMerchant);
router.get('/artist/list', validate(schemas.order.getList, 'query'), getArtistOrders);
router.put('/:id/ship', validate(schemas.order.ship, 'body'), operationLog('order', '发货'), shipOrder);

router.use(requireAdmin);
router.get('/', validate(schemas.order.getList, 'query'), getAllOrders);
router.get('/statistics/data', getOrderStatistics);

export default router;
