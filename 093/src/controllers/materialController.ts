import { Request, Response, NextFunction } from 'express';
import { MaterialService } from '../services/materialService';
import { ResponseUtil } from '../utils/response';
import { MaterialType, MaterialStatus, MaterialFilterParams, LockType } from '../types';

export const materialController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const material = await MaterialService.create(req.body);
      res.status(201).json(ResponseUtil.success(material, '创建成功'));
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const material = await MaterialService.update(id, req.body);
      res.json(ResponseUtil.success(material, '更新成功'));
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await MaterialService.delete(id);
      res.json(ResponseUtil.success(null, '删除成功'));
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const material = await MaterialService.getById(id);
      res.json(ResponseUtil.success(material, '获取成功'));
    } catch (error) {
      next(error);
    }
  },

  async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

      const filters: MaterialFilterParams = {};
      if (req.query.types) {
        filters.types = Array.isArray(req.query.types)
          ? req.query.types as MaterialType[]
          : [req.query.types as MaterialType];
      }
      if (req.query.statuses) {
        filters.statuses = Array.isArray(req.query.statuses)
          ? req.query.statuses as MaterialStatus[]
          : [req.query.statuses as MaterialStatus];
      }
      if (req.query.name) filters.name = req.query.name as string;
      if (req.query.batchNumber) filters.batchNumber = req.query.batchNumber as string;
      if (req.query.supplier) filters.supplier = req.query.supplier as string;
      if (req.query.minQuantity) filters.minQuantity = parseFloat(req.query.minQuantity as string);
      if (req.query.maxQuantity) filters.maxQuantity = parseFloat(req.query.maxQuantity as string);
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

      const result = await MaterialService.getList(page, pageSize, filters);
      res.json(
        ResponseUtil.paginated(result.list, result.total, page, pageSize, '获取成功')
      );
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      const material = await MaterialService.updateStatus(id, status as MaterialStatus);
      res.json(ResponseUtil.success(material, '状态更新成功'));
    } catch (error) {
      next(error);
    }
  },

  async getLowStockAlertList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const materials = await MaterialService.getLowStockAlertList();
      res.json(ResponseUtil.success(materials, '获取成功'));
    } catch (error) {
      next(error);
    }
  },

  async consumeMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { quantity } = req.body;
      const material = await MaterialService.consumeMaterial(id, quantity);
      res.json(ResponseUtil.success(material, '消耗成功'));
    } catch (error) {
      next(error);
    }
  },

  async stockIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const material = await MaterialService.stockIn(id, req.body);
      res.json(ResponseUtil.success(material, '入库成功'));
    } catch (error) {
      next(error);
    }
  },

  async lockMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { orderId, quantity, lockType, remarks } = req.body;
      const lock = await MaterialService.lockMaterial(
        id,
        orderId,
        quantity,
        lockType as LockType,
        req.user?.userId,
        remarks
      );
      res.json(ResponseUtil.success(lock, '锁定成功'));
    } catch (error) {
      next(error);
    }
  },

  async unlockMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await MaterialService.unlockMaterial(id);
      res.json(ResponseUtil.success(null, '解锁成功'));
    } catch (error) {
      next(error);
    }
  },

  async getMaterialLocks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const locks = await MaterialService.getMaterialLocks(id);
      res.json(ResponseUtil.success(locks, '获取成功'));
    } catch (error) {
      next(error);
    }
  },

  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statistics = await MaterialService.getInventoryStatistics();
      res.json(ResponseUtil.success(statistics, '获取成功'));
    } catch (error) {
      next(error);
    }
  },
};
