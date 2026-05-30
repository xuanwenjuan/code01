import { Router } from 'express';
import authRoutes from './auth.routes';
import productCategoryRoutes from './productCategory.routes';
import distributorRoutes from './distributor.routes';
import orderRoutes from './order.routes';
import ticketRoutes from './ticket.routes';
import settlementRoutes from './settlement.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/product-categories', productCategoryRoutes);
router.use('/distributors', distributorRoutes);
router.use('/orders', orderRoutes);
router.use('/tickets', ticketRoutes);
router.use('/settlements', settlementRoutes);

export default router;
