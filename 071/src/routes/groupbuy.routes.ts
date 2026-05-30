import express from 'express';
import groupBuyController from '../controllers/groupbuy.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createGroupBuySchema,
  updateGroupBuySchema,
  getGroupBuySchema
} from '../validations/groupbuy.validation';
import { UserRole } from '../models/User.model';

const router = express.Router();

router.get('/list', groupBuyController.getList);
router.get('/:id', validate(getGroupBuySchema), groupBuyController.getById);

router.use(authMiddleware([UserRole.ADMIN, UserRole.LEADER]));
router.post('/', validate(createGroupBuySchema), groupBuyController.create);
router.put('/:id', validate(updateGroupBuySchema), groupBuyController.update);
router.delete('/:id', validate(getGroupBuySchema), groupBuyController.delete);
router.post('/:id/start', groupBuyController.start);
router.post('/:id/lock', groupBuyController.lock);
router.post('/:id/complete', groupBuyController.complete);
router.post('/:id/cancel', groupBuyController.cancel);

router.use(authMiddleware([UserRole.ADMIN]));
router.post('/process/expired', groupBuyController.triggerProcessExpired);

export default router;
