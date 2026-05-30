import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { authMiddleware, roleGuard } from '../middlewares/auth';
import * as orderController from '../controllers/order.controller';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(orderController.createOrderSchema), orderController.createOrder);
router.post('/:id/pay', validate(orderController.payOrderSchema), orderController.payOrder);
router.post('/:id/accept', validate(orderController.acceptOrderSchema), orderController.acceptOrder);
router.post('/:id/start', validate(orderController.startServiceSchema), orderController.startService);
router.post('/:id/complete', validate(orderController.completeOrderSchema), orderController.completeOrder);
router.post('/:id/cancel', validate(orderController.cancelOrderSchema), orderController.cancelOrder);
router.post('/:id/review', validate(orderController.reviewOrderSchema), orderController.reviewOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', validate(orderController.getOrderByIdSchema), orderController.getOrderById);
router.get('/:id/logs', validate(orderController.getOrderStatusLogsSchema), orderController.getOrderStatusLogs);

router.use(roleGuard(UserRole.ADMIN, UserRole.OPERATOR));

router.put('/:id/assign', validate(orderController.assignOrderSchema), orderController.assignOrder);

router.use(roleGuard(UserRole.ADMIN, UserRole.OPERATOR, UserRole.FINANCE));

router.get('/', orderController.getOrderList);

export default router;
