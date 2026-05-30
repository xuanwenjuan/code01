import { Router } from 'express';
import {
  scanAndCreateExpiryReminders,
  getReminderList,
  getReminderDetail,
  markAsRead,
  handleReminder,
  getReminderStatistics
} from '../controllers/supplierReminder.controller';
import { authenticate, authorizeManager } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  idParam,
  handleReminderValidationRules,
  markAsReadValidationRules,
  reminderQueryRules
} from '../validations/supplierReminder.validation';

const router = Router();

router.get('/statistics', authenticate, getReminderStatistics);
router.get('/', authenticate, validate(reminderQueryRules), getReminderList);
router.get('/:id', authenticate, validate(idParam), getReminderDetail);
router.post('/scan', authenticate, authorizeManager, scanAndCreateExpiryReminders);
router.put('/mark-read', authenticate, validate(markAsReadValidationRules), markAsRead);
router.put('/:id/handle', authenticate, authorizeManager, validate(handleReminderValidationRules), handleReminder);

export default router;
