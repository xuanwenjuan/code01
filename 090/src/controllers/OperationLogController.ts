import { Request, Response, NextFunction } from 'express';
import { OperationLogService } from '../services/OperationLogService';
import { ResponseUtil } from '../utils/response';
import { OperationModule, OperationType } from '../types';

export class OperationLogController {
  static async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await OperationLogService.getList({
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20,
        module: req.query.module as OperationModule,
        type: req.query.type as OperationType,
        operatorId: req.query.operatorId ? parseInt(req.query.operatorId as string) : undefined,
        storeId: req.query.storeId ? parseInt(req.query.storeId as string) : undefined,
        targetId: req.query.targetId ? parseInt(req.query.targetId as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        keyword: req.query.keyword as string
      });
      res.json(ResponseUtil.success(result, '获取操作日志列表成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const record = await OperationLogService.getById(parseInt(id));
      if (!record) {
        res.status(404).json(ResponseUtil.notFound(null, '日志记录不存在'));
        return;
      }
      res.json(ResponseUtil.success(record, '获取日志详情成功'));
    } catch (error) {
      next(error);
    }
  }
}
