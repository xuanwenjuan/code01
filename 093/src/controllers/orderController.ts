import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { ResponseUtil } from '../utils/response';
import { OrderStatus, CompleteOrderParams } from '../types';

export const orderController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createdBy = req.user?.userId;
      const order = await OrderService.create(req.body, createdBy);
      res.status(201).json(ResponseUtil.success(order, '创建成功'));
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const order = await OrderService.update(id, req.body);
      res.json(ResponseUtil.success(order, '更新成功'));
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const operatorId = req.user?.userId;
      const operatorRole = req.user?.role;
      const order = await OrderService.updateStatus(id, {
        ...req.body,
        operatorId,
        operatorRole,
      });
      res.json(ResponseUtil.success(order, '状态更新成功'));
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const order = await OrderService.getById(id);
      res.json(ResponseUtil.success(order, '获取成功'));
    } catch (error) {
      next(error);
    }
  },

  async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
      const orderNo = req.query.orderNo as string;
      const customerName = req.query.customerName as string;
      const status = req.query.status as OrderStatus;
      const assignedTo = req.query.assignedTo ? parseInt(req.query.assignedTo as string, 10) : undefined;

      const result = await OrderService.getList(page, pageSize, orderNo, customerName, status, assignedTo);
      res.json(
        ResponseUtil.paginated(result.list, result.total, page, pageSize, '获取成功')
      );
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const operatorId = req.user?.userId;
      const operatorRole = req.user?.role;
      const order = await OrderService.cancelOrder(id, operatorId, operatorRole);
      res.json(ResponseUtil.success(order, '取消成功'));
    } catch (error) {
      next(error);
    }
  },

  async scheduleProduction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { materialId, requiredQuantity, remarks } = req.body;
      const order = await OrderService.scheduleProduction(
        id,
        materialId,
        requiredQuantity,
        req.user?.userId,
        remarks
      );
      res.json(ResponseUtil.success(order, '排产成功'));
    } catch (error) {
      next(error);
    }
  },

  async completeOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const params: CompleteOrderParams = {
        orderId: id,
        actualMaterialUsed: req.body.actualMaterialUsed,
        laborHours: req.body.laborHours,
        machineHours: req.body.machineHours,
        additionalCosts: req.body.additionalCosts,
        remarks: req.body.remarks,
        operatorId: req.user?.userId,
      };
      const costResult = await OrderService.completeOrder(params);
      res.json(ResponseUtil.success(costResult, '订单完工成功'));
    } catch (error) {
      next(error);
    }
  },

  async getOrderMaterialLocks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const locks = await OrderService.getOrderMaterialLocks(id);
      res.json(ResponseUtil.success(locks, '获取成功'));
    } catch (error) {
      next(error);
    }
  },

  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statistics = await OrderService.getStatusStatistics();
      res.json(ResponseUtil.success(statistics, '获取成功'));
    } catch (error) {
      next(error);
    }
  },
};
