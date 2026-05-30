import { Response, NextFunction } from 'express';
import orderService from '../services/orderService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { OrderStatus } from '../models/Order';

class OrderController {
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderData = {
        ...req.body,
        operatorId: req.user?.id
      };
      const order = await orderService.createOrder(orderData);
      ResponseUtil.success(res, order, '订单创建成功');
    } catch (error) {
      next(error);
    }
  }

  async updateOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.updateOrder(Number(id), req.body);
      ResponseUtil.success(res, order, '订单更新成功');
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(Number(id));
      ResponseUtil.success(res, order);
    } catch (error) {
      next(error);
    }
  }

  async getOrderList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        status,
        shipperBranchId,
        receiverBranchId,
        vehicleId,
        keyword,
        startDate,
        endDate,
        page,
        pageSize,
        sortBy,
        sortOrder
      } = req.query;

      const result = await orderService.getOrderList({
        status: status as OrderStatus,
        shipperBranchId: shipperBranchId ? Number(shipperBranchId) : undefined,
        receiverBranchId: receiverBranchId ? Number(receiverBranchId) : undefined,
        vehicleId: vehicleId ? Number(vehicleId) : undefined,
        keyword: keyword as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'ASC' | 'DESC'
      });
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async pickupOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { remark, vehicleId } = req.body;
      const order = await orderService.pickupOrder(
        Number(id),
        req.user?.id,
        req.user?.username,
        remark,
        vehicleId ? Number(vehicleId) : undefined
      );
      ResponseUtil.success(res, order, '揽收成功');
    } catch (error) {
      next(error);
    }
  }

  async startTransit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { vehicleId, remark } = req.body;
      const order = await orderService.startTransit(
        Number(id),
        vehicleId,
        req.user?.id,
        req.user?.username,
        remark
      );
      ResponseUtil.success(res, order, '开始干线运输');
    } catch (error) {
      next(error);
    }
  }

  async transferOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { currentBranchId, remark } = req.body;
      const order = await orderService.transferOrder(
        Number(id),
        currentBranchId,
        req.user?.id,
        req.user?.username,
        remark
      );
      ResponseUtil.success(res, order, '中转分拨完成');
    } catch (error) {
      next(error);
    }
  }

  async startDelivery(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { remark } = req.body;
      const order = await orderService.startDelivery(
        Number(id),
        req.user?.id,
        req.user?.username,
        remark
      );
      ResponseUtil.success(res, order, '开始末端派送');
    } catch (error) {
      next(error);
    }
  }

  async signOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { remark } = req.body;
      const order = await orderService.signOrder(
        Number(id),
        req.user?.id,
        req.user?.username,
        remark
      );
      ResponseUtil.success(res, order, '签收成功');
    } catch (error) {
      next(error);
    }
  }

  async markAbnormal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { remark } = req.body;
      const order = await orderService.markAbnormal(
        Number(id),
        remark,
        req.user?.id,
        req.user?.username
      );
      ResponseUtil.success(res, order, '标记异常成功');
    } catch (error) {
      next(error);
    }
  }

  async resolveAbnormal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { targetStatus, remark, vehicleId } = req.body;
      const order = await orderService.resolveAbnormal(
        Number(id),
        targetStatus,
        remark,
        req.user?.id,
        req.user?.username,
        vehicleId ? Number(vehicleId) : undefined
      );
      ResponseUtil.success(res, order, '异常处理完成');
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { remark } = req.body;
      const order = await orderService.cancelOrder(
        Number(id),
        remark,
        req.user?.id,
        req.user?.username
      );
      ResponseUtil.success(res, order, '订单取消成功');
    } catch (error) {
      next(error);
    }
  }

  async getOrderLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const logs = await orderService.getOrderLogs(Number(id));
      ResponseUtil.success(res, logs);
    } catch (error) {
      next(error);
    }
  }

  async getOrderStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, branchId, vehicleId } = req.query;
      const statistics = await orderService.getOrderStatistics({
        startDate: startDate as string,
        endDate: endDate as string,
        branchId: branchId ? Number(branchId) : undefined,
        vehicleId: vehicleId ? Number(vehicleId) : undefined
      });
      ResponseUtil.success(res, statistics);
    } catch (error) {
      next(error);
    }
  }

  async autoTransitionStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await orderService.autoTransitionStatus();
      ResponseUtil.success(res, null, '订单状态自动流转完成');
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
