import { Router } from 'express';
import { RentalOrderController } from '../controllers/RentalOrderController';
import { authenticate, requireStoreManagerOrSuperAdmin, requireRentalStaffOrAbove } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', RentalOrderController.getList);
router.get('/overdue', RentalOrderController.getOverdueOrders);
router.get('/statistics', RentalOrderController.getStatistics);
router.get('/:id', RentalOrderController.getById);

router.post('/', requireRentalStaffOrAbove, RentalOrderController.create);
router.put('/:id/confirm', requireRentalStaffOrAbove, RentalOrderController.confirm);
router.post('/outbound', requireRentalStaffOrAbove, RentalOrderController.outbound);
router.put('/:id/start-use', requireRentalStaffOrAbove, RentalOrderController.startUse);
router.post('/return', requireRentalStaffOrAbove, RentalOrderController.return);
router.put('/:id/complete', requireStoreManagerOrSuperAdmin, RentalOrderController.complete);
router.put('/:id/cancel', requireStoreManagerOrSuperAdmin, RentalOrderController.cancel);
router.post('/process-overdue', requireStoreManagerOrSuperAdmin, RentalOrderController.processOverdueOrders);

export default router;
