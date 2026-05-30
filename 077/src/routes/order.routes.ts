import { Router } from 'express';
import {
  createOrder,
  updateOrder,
  cancelOrder,
  payDeposit,
  deliverEquipment,
  startRental,
  returnEquipment,
  payRent,
  getOrder,
  getOrderList,
  getOrderLogs,
  getOrderStats
} from '../controllers/order.controller';
import { authenticateJWT, requireOperator, requireFinance, requireAdmin } from '../middlewares/jwt.middleware';

const router = Router();

router.get('/stats', authenticateJWT, getOrderStats);
router.get('/:id', authenticateJWT, getOrder);
router.get('/:id/logs', authenticateJWT, getOrderLogs);
router.get('/', authenticateJWT, getOrderList);

router.use(authenticateJWT);
router.use(requireOperator);

router.post('/', createOrder);
router.put('/:id', updateOrder);
router.post('/:id/cancel', cancelOrder);
router.post('/:id/deliver', deliverEquipment);
router.post('/:id/start-rental', startRental);
router.post('/:id/return', returnEquipment);

router.use(requireFinance);

router.post('/:id/pay-deposit', payDeposit);
router.post('/:id/pay-rent', payRent);

export default router;
