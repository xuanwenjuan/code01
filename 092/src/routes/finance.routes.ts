import { Router } from 'express';
import {
  getRevenueStatistics,
  getCategoryStatistics,
  getEquipmentUtilization,
  getSummaryStatistics,
  getCustomerStatistics,
  getSalespersonStatistics,
  getDamageStatistics,
  getPaymentStatistics,
} from '../controllers/finance.controller';
import { authMiddleware, roleMiddleware } from '../middleware';
import { UserRole } from '../common/enums';

const router = Router();

router.get('/summary', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.FINANCE), getSummaryStatistics);
router.get('/revenue', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.FINANCE), getRevenueStatistics);
router.get('/category', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.FINANCE), getCategoryStatistics);
router.get('/utilization', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.FINANCE), getEquipmentUtilization);
router.get('/customer', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.FINANCE), getCustomerStatistics);
router.get('/salesperson', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.FINANCE), getSalespersonStatistics);
router.get('/damage', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.FINANCE), getDamageStatistics);
router.get('/payment', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.FINANCE), getPaymentStatistics);

export default router;