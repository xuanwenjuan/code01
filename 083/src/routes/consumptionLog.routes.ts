import { Router } from 'express';
import { consumptionLogController } from '../controllers/consumptionLog.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { RoleCode } from '../constants/role';

const router = Router();

router.use(authMiddleware);

router.get(
  '/list',
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.FINANCE),
  consumptionLogController.getLogList.bind(consumptionLogController)
);

router.get(
  '/statistics',
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.FINANCE),
  consumptionLogController.getStatistics.bind(consumptionLogController)
);

export default router;
