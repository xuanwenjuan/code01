import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller';
import { authenticate, authorize } from '../middleware/auth';
import { logOperation } from '../middleware/operationLog';
import { validate, validationRules } from '../middleware/validation';
import { UserRole } from '../types/common';
import { OperationType } from '../database/models/operationLog.model';

const router = Router();

router.use(authenticate);

router.get(
  '/statistics',
  ticketController.getStatistics
);
router.get(
  '/verify-records',
  [...validationRules.pagination, validate],
  ticketController.getVerifyRecords
);
router.get(
  '/code/:code',
  ticketController.getByCode
);
router.get(
  '/:id',
  [...validationRules.idParam, validate],
  ticketController.getById
);
router.get(
  '/',
  [...validationRules.pagination, ...validationRules.ticket.query, validate],
  ticketController.getList
);

router.post(
  '/verify',
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR),
  [...validationRules.ticket.verify, validate],
  logOperation('票券', OperationType.VERIFY),
  ticketController.verify
);

router.post(
  '/batch-verify',
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR),
  logOperation('票券', OperationType.VERIFY),
  ticketController.batchVerify
);

export default router;
