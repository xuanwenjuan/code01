import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { authMiddleware, roleGuard } from '../middlewares/auth';
import * as settlementController from '../controllers/settlement.controller';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/my', settlementController.getMySettlements);
router.get('/statistics', validate(settlementController.getSettlementStatisticsSchema), settlementController.getSettlementStatistics);
router.get('/:id', validate(settlementController.getSettlementByIdSchema), settlementController.getSettlementById);

router.use(roleGuard(UserRole.ADMIN, UserRole.FINANCE));

router.get('/', settlementController.getSettlementList);
router.post('/:id/settle', validate(settlementController.settleSchema), settlementController.settle);

export default router;
