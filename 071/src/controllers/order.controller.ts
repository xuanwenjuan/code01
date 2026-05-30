import { Request, Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { OrderStatus } from '../models/Order.model';

class OrderController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.createOrder(req.body);
      return ResponseUtil.success(res, order, '下单成功');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(Number(id));
      return ResponseUtil.success(res, order);
    } catch (error) {
      next(error);
    }
  }

  async getList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, pageSize, status, userId, leaderId, groupBuyId } = req.query;
      const result = await orderService.getOrderList({
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        status: status as OrderStatus | undefined,
        userId: userId ? Number(userId) : undefined,
        leaderId: leaderId ? Number(leaderId) : undefined,
        groupBuyId: groupBuyId ? Number(groupBuyId) : undefined
      });
      return ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { page, pageSize, status } = req.query;
      const result = await orderService.getOrderList({
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        status: status as OrderStatus | undefined,
        userId: Number(userId)
      });
      return ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getLeaderOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const leaderId = req.user?.id;
      const { page, pageSize, status } = req.query;
      const result = await orderService.getOrderList({
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        status: status as OrderStatus | undefined,
        leaderId: Number(leaderId)
      });
      return ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.updateOrder(Number(id), req.body);
      return ResponseUtil.success(res, order, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, cancelReason } = req.body;
      const order = await orderService.updateOrderStatus(Number(id), status, cancelReason);
      return ResponseUtil.success(res, order, '状态更新成功');
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { cancelReason } = req.body;
      const order = await orderService.cancelOrder(Number(id), cancelReason);
      return ResponseUtil.success(res, order, '取消成功');
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { leaderId } = req.query;
      const stats = await orderService.getOrderStatistics(leaderId ? Number(leaderId) : undefined);
      return ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
