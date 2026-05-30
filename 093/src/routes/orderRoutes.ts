import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authenticate, requirePermission, Permission } from '../middlewares/auth';
import { orderValidators, validate, idValidation, paginationValidation } from '../middlewares/validation';

const router = Router();

router.use(authenticate);

router.get('/',
  paginationValidation,
  validate,
  requirePermission(Permission.ORDER.VIEW),
  orderController.getList
);

router.get('/statistics',
  requirePermission(Permission.ORDER.VIEW),
  orderController.getStatistics
);

router.get('/:id',
  idValidation,
  validate,
  requirePermission(Permission.ORDER.VIEW),
  orderController.getById
);

router.get('/:id/locks',
  idValidation,
  validate,
  requirePermission(Permission.ORDER.VIEW),
  orderController.getOrderMaterialLocks
);

router.post('/',
  orderValidators.create,
  validate,
  requirePermission(Permission.ORDER.CREATE),
  orderController.create
);

router.put('/:id',
  orderValidators.update,
  validate,
  requirePermission(Permission.ORDER.UPDATE),
  orderController.update
);

router.patch('/:id/status',
  orderValidators.updateStatus,
  validate,
  requirePermission(Permission.ORDER.UPDATE_STATUS),
  orderController.updateStatus
);

router.post('/:id/cancel',
  idValidation,
  validate,
  requirePermission(Permission.ORDER.CANCEL),
  orderController.cancelOrder
);

router.post('/:id/schedule',
  orderValidators.schedule,
  validate,
  requirePermission(Permission.ORDER.SCHEDULE),
  orderController.scheduleProduction
);

router.post('/:id/complete',
  orderValidators.complete,
  validate,
  requirePermission(Permission.ORDER.COMPLETE),
  orderController.completeOrder
);

export default router;
