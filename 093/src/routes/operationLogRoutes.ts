import { Router } from 'express';
import { operationLogController } from '../controllers/operationLogController';
import { authenticate, requirePermission, Permission } from '../middlewares/auth';
import { operationLogValidators, validate, idValidation, paginationValidation } from '../middlewares/validation';

const router = Router();

router.use(authenticate);

router.get('/',
  operationLogValidators.list,
  validate,
  requirePermission(Permission.ORDER.VIEW),
  operationLogController.getList
);

router.get('/:id',
  idValidation,
  validate,
  requirePermission(Permission.ORDER.VIEW),
  operationLogController.getById
);

router.get('/:module/:recordId',
  operationLogValidators.recordLogs,
  validate,
  requirePermission(Permission.ORDER.VIEW),
  operationLogController.getRecordLogs
);

export default router;
