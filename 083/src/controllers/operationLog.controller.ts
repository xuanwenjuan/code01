import { Response } from 'express';
import { operationLogService } from '../services/operationLog.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export class OperationLogController {
  async getLogList(req: AuthRequest, res: Response) {
    const { page, pageSize, module, operation, operatorId, targetId, startDate, endDate } = req.query;
    const result = await operationLogService.getLogList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      module: module as string,
      operation: operation as string,
      operatorId: operatorId ? Number(operatorId) : undefined,
      targetId: targetId ? Number(targetId) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    return ResponseUtil.success(res, result);
  }
}

export const operationLogController = new OperationLogController();
