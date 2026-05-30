import { Router } from 'express';
import { materialController } from '../controllers/materialController';
import { authenticate, requirePermission, Permission } from '../middlewares/auth';
import { materialValidators, validate, idValidation, paginationValidation } from '../middlewares/validation';

const router = Router();

router.use(authenticate);

router.get('/',
  paginationValidation,
  materialValidators.filter,
  validate,
  requirePermission(Permission.MATERIAL.VIEW),
  materialController.getList
);

router.get('/statistics',
  requirePermission(Permission.MATERIAL.VIEW),
  materialController.getStatistics
);

router.get('/low-stock',
  requirePermission(Permission.MATERIAL.VIEW),
  materialController.getLowStockAlertList
);

router.get('/:id',
  idValidation,
  validate,
  requirePermission(Permission.MATERIAL.VIEW),
  materialController.getById
);

router.get('/:id/locks',
  idValidation,
  validate,
  requirePermission(Permission.MATERIAL.VIEW),
  materialController.getMaterialLocks
);

router.post('/',
  materialValidators.create,
  validate,
  requirePermission(Permission.MATERIAL.CREATE),
  materialController.create
);

router.put('/:id',
  materialValidators.update,
  validate,
  requirePermission(Permission.MATERIAL.UPDATE),
  materialController.update
);

router.delete('/:id',
  idValidation,
  validate,
  requirePermission(Permission.MATERIAL.DELETE),
  materialController.delete
);

router.patch('/:id/status',
  materialValidators.updateStatus,
  validate,
  requirePermission(Permission.MATERIAL.UPDATE),
  materialController.updateStatus
);

router.post('/:id/consume',
  materialValidators.consume,
  validate,
  requirePermission(Permission.MATERIAL.CONSUME),
  materialController.consumeMaterial
);

router.post('/:id/stock-in',
  materialValidators.stockIn,
  validate,
  requirePermission(Permission.MATERIAL.STOCK_IN),
  materialController.stockIn
);

router.post('/:id/lock',
  materialValidators.lock,
  validate,
  requirePermission(Permission.MATERIAL.LOCK),
  materialController.lockMaterial
);

router.post('/:id/unlock',
  idValidation,
  validate,
  requirePermission(Permission.MATERIAL.UNLOCK),
  materialController.unlockMaterial
);

export default router;
