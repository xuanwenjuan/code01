import { Request, Response, NextFunction } from 'express';
import { RentalOrderService } from '../services/RentalOrderService';
import { ResponseUtil } from '../utils/response';
import { OrderStatus } from '../types';

export class RentalOrderController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await RentalOrderService.create({
        ...req.body,
        operatorId: req.user!.id,
        operatorName: req.user!.realName,
        req
      });
      res.status(201).json(ResponseUtil.created(order, '订单创建成功'));
    } catch (error) {
      next(error);
    }
  }

  static async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await RentalOrderService.confirm(parseInt(id), req.user!.id, req.user!.realName, req);
      res.json(ResponseUtil.success(order, '订单确认成功'));
    } catch (error) {
      next(error);
    }
  }

  static async outbound(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await RentalOrderService.outbound({
        ...req.body,
        operatorId: req.user!.id,
        operatorName: req.user!.realName,
        req
      });
      res.json(ResponseUtil.success(order, '装备出库成功'));
    } catch (error) {
      next(error);
    }
  }

  static async startUse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await RentalOrderService.startUse(parseInt(id), req.user!.id, req.user!.realName, req);
      res.json(ResponseUtil.success(order, '开始使用成功'));
    } catch (error) {
      next(error);
    }
  }

  static async return(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await RentalOrderService.return({
        ...req.body,
        operatorId: req.user!.id,
        operatorName: req.user!.realName,
        req
      });
      res.json(ResponseUtil.success(order, '装备归还成功'));
    } catch (error) {
      next(error);
    }
  }

  static async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await RentalOrderService.complete(parseInt(id), req.user!.id, req.user!.realName, req);
      res.json(ResponseUtil.success(order, '订单完成成功'));
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await RentalOrderService.cancel(parseInt(id), req.user!.id, req.user!.realName, req);
      res.json(ResponseUtil.success(order, '订单取消成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await RentalOrderService.getById(parseInt(id));
      if (!order) {
        res.status(404).json(ResponseUtil.notFound(null, '订单不存在'));
        return;
      }
      res.json(ResponseUtil.success(order, '获取订单详情成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await RentalOrderService.getList({
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20,
        orderNo: req.query.orderNo as string,
        customerName: req.query.customerName as string,
        customerPhone: req.query.customerPhone as string,
        equipmentId: req.query.equipmentId ? parseInt(req.query.equipmentId as string) : undefined,
        storeId: req.query.storeId ? parseInt(req.query.storeId as string) : undefined,
        status: req.query.status as OrderStatus,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      }, req.user!.role, req.user!.storeId);
      res.json(ResponseUtil.success(result, '获取订单列表成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getOverdueOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await RentalOrderService.getOverdueOrders();
      res.json(ResponseUtil.success(list, '获取逾期订单成功'));
    } catch (error) {
      next(error);
    }
  }

  static async processOverdueOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await RentalOrderService.processOverdueOrders();
      res.json(ResponseUtil.success({ processedCount: count }, `成功处理${count}个逾期订单`));
    } catch (error) {
      next(error);
    }
  }

  static async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await RentalOrderService.getStatistics({
        storeId: req.query.storeId ? parseInt(req.query.storeId as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      });
      res.json(ResponseUtil.success(stats, '获取订单统计成功'));
    } catch (error) {
      next(error);
    }
  }
}
