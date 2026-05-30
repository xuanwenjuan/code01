import { Router } from 'express';
import { operationLogController } from '../controllers/operationLog.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { RoleCode } from '../constants/role';

const router = Router();

router.use(authMiddleware);

router.get(
  '/list',
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER),
  operationLogController.getLogList.bind(operationLogController)
);

export default router;
