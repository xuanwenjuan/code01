import { Router } from 'express';
import OrderController from '../controllers/order.controller';
import { authenticate, requireAdmin, requireWorker } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createOrderSchema,
  assignOrderSchema,
  getOrderListSchema,
  orderIdSchema
} from '../validations/order.validation';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderSchema), OrderController.createOrder);
router.get('/my', validate(getOrderListSchema), OrderController.getCustomerOrders);
router.get('/worker', validate(getOrderListSchema), OrderController.getWorkerOrders);
router.get('/:orderId', validate(orderIdSchema), OrderController.getOrderById);
router.get('/:orderId/history', validate(orderIdSchema), OrderController.getOrderStatusHistory);
router.patch('/:orderId/pay', validate(orderIdSchema), OrderController.payOrder);
router.patch('/:orderId/cancel', validate(orderIdSchema), OrderController.customerCancelOrder);
router.patch('/:orderId/worker/accept', validate(orderIdSchema), requireWorker, OrderController.workerAcceptOrder);
router.patch('/:orderId/worker/start', validate(orderIdSchema), requireWorker, OrderController.workerStartService);
router.patch('/:orderId/worker/complete', validate(orderIdSchema), requireWorker, OrderController.workerCompleteService);

router.use(requireAdmin);
router.get('/', validate(getOrderListSchema), OrderController.getAllOrders);
router.patch('/:orderId/assign', validate(assignOrderSchema), OrderController.assignOrder);
router.post('/process-timeout', OrderController.processTimeoutOrders);

export default router;
