import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import supplierRoutes from './supplier.routes';
import reagentRoutes from './reagent.routes';
import stockRoutes from './stock.routes';
import requisitionRoutes from './requisition.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/reagents', reagentRoutes);
router.use('/stock', stockRoutes);
router.use('/requisitions', requisitionRoutes);

export default router;
