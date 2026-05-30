import { Router } from 'express';
import {
  getAlertList,
  getAlertDetail,
  handleAlert,
  batchHandleAlerts,
  scanAndGenerateAlerts,
  getAlertStatistics
} from '../controllers/alert.controller';
import { authenticate, authorizeManager } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { handleAlertValidationRules, alertQueryRules, idParam } from '../validations/alert.validation';

const router = Router();

router.get('/statistics', authenticate, getAlertStatistics);
router.get('/', authenticate, validate(alertQueryRules), getAlertList);
router.get('/:id', authenticate, validate(idParam), getAlertDetail);
router.put('/:id/handle', authenticate, authorizeManager, validate(handleAlertValidationRules), handleAlert);
router.post('/batch-handle', authenticate, authorizeManager, batchHandleAlerts);
router.post('/scan', authenticate, authorizeManager, scanAndGenerateAlerts);

export default router;
