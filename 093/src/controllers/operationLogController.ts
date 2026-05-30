import { Request, Response, NextFunction } from 'express';
import { OperationLogService } from '../services/operationLogService';
import { ResponseUtil } from '../utils/response';
import { OperationModule, OperationType } from '../types';

export const operationLogController = {
  async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 20;

      const filters: any = {};
      if (req.query.module) filters.module = req.query.module as OperationModule;
      if (req.query.operationType) filters.operationType = req.query.operationType as OperationType;
      if (req.query.operatorId) filters.operatorId = parseInt(req.query.operatorId as string, 10);
      if (req.query.recordId) filters.recordId = parseInt(req.query.recordId as string, 10);
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

      const result = await OperationLogService.getList(page, pageSize, filters);
      res.json(
        ResponseUtil.paginated(result.list, result.total, page, pageSize, '获取成功')
      );
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const log = await OperationLogService.getById(id);
      if (!log) {
        res.status(404).json(ResponseUtil.notFound('日志不存在'));
        return;
      }
      res.json(ResponseUtil.success(log, '获取成功'));
    } catch (error) {
      next(error);
    }
  },

  async getRecordLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { module, recordId } = req.params;
      const limit = parseInt(req.query.limit as string, 10) || 50;

      const logs = await OperationLogService.getRecordLogs(
        module as OperationModule,
        parseInt(recordId, 10),
        limit
      );
      res.json(ResponseUtil.success(logs, '获取成功'));
    } catch (error) {
      next(error);
    }
  },
};
