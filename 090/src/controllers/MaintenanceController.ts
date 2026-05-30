import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/MaintenanceService';
import { ResponseUtil } from '../utils/response';
import { MaintenanceStatus, MaintenanceType } from '../types';

export class MaintenanceController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await MaintenanceService.create({
        ...req.body,
        operatorId: req.user!.id,
        operatorName: req.user!.realName,
        req
      });
      res.status(201).json(ResponseUtil.created(record, '维保记录创建成功'));
    } catch (error) {
      next(error);
    }
  }

  static async startMaintenance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const record = await MaintenanceService.startMaintenance(
        parseInt(id),
        req.user!.id,
        req.user!.realName,
        req
      );
      res.json(ResponseUtil.success(record, '开始维保成功'));
    } catch (error) {
      next(error);
    }
  }

  static async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await MaintenanceService.complete({
        ...req.body,
        operatorId: req.user!.id,
        operatorName: req.user!.realName,
        req
      });
      res.json(ResponseUtil.success(record, '维保完成成功'));
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const record = await MaintenanceService.cancel(
        parseInt(id),
        req.user!.id,
        req.user!.realName,
        req
      );
      res.json(ResponseUtil.success(record, '维保取消成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const record = await MaintenanceService.getById(parseInt(id));
      if (!record) {
        res.status(404).json(ResponseUtil.notFound(null, '维保记录不存在'));
        return;
      }
      res.json(ResponseUtil.success(record, '获取维保记录详情成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await MaintenanceService.getList({
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20,
        recordNo: req.query.recordNo as string,
        equipmentId: req.query.equipmentId ? parseInt(req.query.equipmentId as string) : undefined,
        storeId: req.query.storeId ? parseInt(req.query.storeId as string) : undefined,
        type: req.query.type as MaintenanceType,
        status: req.query.status as MaintenanceStatus,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      }, req.user!.role, req.user!.storeId);
      res.json(ResponseUtil.success(result, '获取维保记录列表成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await MaintenanceService.getStats({
        storeId: req.query.storeId ? parseInt(req.query.storeId as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      });
      res.json(ResponseUtil.success(stats, '获取维保统计成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getEquipmentMaintenanceHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { equipmentId } = req.params;
      const list = await MaintenanceService.getEquipmentMaintenanceHistory(parseInt(equipmentId));
      res.json(ResponseUtil.success(list, '获取装备维保历史成功'));
    } catch (error) {
      next(error);
    }
  }
}
