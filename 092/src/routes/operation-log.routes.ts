import { Router } from 'express';
import { OperationLogService } from '../services/operation-log.service';
import { authMiddleware, roleMiddleware } from '../middleware';
import { UserRole } from '../common/enums';

const router = Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  async (req, res) => {
    const { page = 1, pageSize = 20, module, operation, userId, startDate, endDate } = req.query;
    const result = await OperationLogService.getLogs({
      page: Number(page),
      pageSize: Number(pageSize),
      module: module as string,
      operation: operation as string,
      userId: userId ? Number(userId) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json({
      code: 200,
      message: '查询成功',
      data: result,
      success: true,
    });
  }
);

export default router;
