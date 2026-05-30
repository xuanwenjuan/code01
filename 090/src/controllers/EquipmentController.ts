import { Request, Response, NextFunction } from 'express';
import { EquipmentService } from '../services/EquipmentService';
import { ResponseUtil } from '../utils/response';
import { EquipmentStatus } from '../types';

export class EquipmentController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const equipment = await EquipmentService.create({
        ...req.body,
        operatorId: req.user!.id,
        operatorName: req.user!.realName,
        req
      });
      res.status(201).json(ResponseUtil.created(equipment, '装备创建成功'));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const equipment = await EquipmentService.update({
        id: parseInt(id),
        ...req.body,
        operatorId: req.user!.id,
        operatorName: req.user!.realName,
        req
      });
      res.json(ResponseUtil.success(equipment, '装备更新成功'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await EquipmentService.delete(parseInt(id), req.user!.id, req.user!.realName, req);
      res.json(ResponseUtil.success(null, '装备删除成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const equipment = await EquipmentService.getById(parseInt(id));
      if (!equipment) {
        res.status(404).json(ResponseUtil.notFound(null, '装备不存在'));
        return;
      }
      res.json(ResponseUtil.success(equipment, '获取装备详情成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EquipmentService.getList({
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20,
        keyword: req.query.keyword as string,
        equipmentNo: req.query.equipmentNo as string,
        name: req.query.name as string,
        brand: req.query.brand as string,
        model: req.query.model as string,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        storeId: req.query.storeId ? parseInt(req.query.storeId as string) : undefined,
        status: req.query.status as EquipmentStatus,
        hasWarning: req.query.hasWarning === 'true'
      }, req.user!.role, req.user!.storeId);
      res.json(ResponseUtil.success(result, '获取装备列表成功'));
    } catch (error) {
      next(error);
    }
  }

  static async generateEquipmentNo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const equipmentNo = await EquipmentService.generateEquipmentNo();
      res.json(ResponseUtil.success({ equipmentNo }, '生成装备编号成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getEquipmentWarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const warnings = await EquipmentService.getEquipmentWarnings(storeId);
      res.json(ResponseUtil.success(warnings, '获取装备预警信息成功'));
    } catch (error) {
      next(error);
    }
  }

  static async lockForRent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const equipment = await EquipmentService.lockForRent(parseInt(id), req.user!.id, req.user!.realName, req);
      res.json(ResponseUtil.success(equipment, '装备锁定成功'));
    } catch (error) {
      next(error);
    }
  }

  static async unlock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const equipment = await EquipmentService.unlock(parseInt(id), req.user!.id, req.user!.realName, req);
      res.json(ResponseUtil.success(equipment, '装备解锁成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const stats = await EquipmentService.getStats(storeId);
      res.json(ResponseUtil.success(stats, '获取装备统计成功'));
    } catch (error) {
      next(error);
    }
  }
}
