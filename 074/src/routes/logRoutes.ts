import { Router } from 'express';
import * as logController from '../controllers/logController';
import { authenticate, hasPermission, Permission } from '../middleware/auth';
import { validate, idParamValidation } from '../middleware/validation';
import { logValidation } from '../middleware/validationRules';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  hasPermission(Permission.LOG.VIEW),
  validate(logValidation.query),
  logController.getLogs
);

router.get(
  '/:id',
  hasPermission(Permission.LOG.VIEW),
  validate(idParamValidation),
  logController.getLogById
);

export default router;
