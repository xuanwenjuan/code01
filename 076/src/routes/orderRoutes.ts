import { Router } from 'express';
import {
  createOrder,
  payOrder,
  startMaking,
  finishMaking,
  assignRider,
  completeDelivery,
  confirmOrder,
  cancelOrder,
  getOrder,
  getOrderList,
  getAvailableRiders
} from '../controllers/orderController';
import { authenticate, requireStaff, requireRider, requireCustomer } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { orderSchemas } from '../validation/schemas';

const router = Router();

router.use(authenticate);
router.post('/', validateRequest({ body: orderSchemas.create }), createOrder);
router.get('/', validateRequest({ query: orderSchemas.query }), getOrderList);
router.get('/riders', getAvailableRiders);
router.get('/:id', getOrder);
router.put('/:id/pay', payOrder);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/confirm', confirmOrder);

router.use(requireStaff);
router.put('/:id/start-making', startMaking);
router.put('/:id/finish-making', finishMaking);
router.put('/:id/assign-rider', validateRequest({ body: orderSchemas.riderAssign }), assignRider);

router.use(requireRider);
router.put('/:id/complete-delivery', completeDelivery);

export default router;
