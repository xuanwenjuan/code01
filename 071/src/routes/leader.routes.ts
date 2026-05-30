import express from 'express';
import leaderController from '../controllers/leader.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createLeaderSchema,
  updateLeaderSchema,
  auditLeaderSchema,
  getLeaderSchema
} from '../validations/leader.validation';
import { UserRole } from '../models/User.model';

const router = express.Router();

router.get('/list', leaderController.getList);
router.get('/:id', validate(getLeaderSchema), leaderController.getById);

router.use(authMiddleware());
router.post('/', validate(createLeaderSchema), leaderController.create);
router.put('/:id', validate(updateLeaderSchema), leaderController.update);
router.get('/my/info', leaderController.getByUserId);

router.use(authMiddleware([UserRole.ADMIN]));
router.post('/:id/audit', validate(auditLeaderSchema), leaderController.audit);
router.patch('/:id/status', leaderController.updateStatus);

export default router;
