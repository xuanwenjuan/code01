import { Request, Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import { ResponseUtil } from '../utils/response';
import { OrderStatus } from '../types';

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const result = await orderService.createOrder(customerId, req.body);
      ResponseUtil.created(res, result, '创建订单成功');
    } catch (error) {
      next(error);
    }
  }

  static async payOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const customerId = req.user!.userId;
      const result = await orderService.payOrder(orderId, customerId);
      ResponseUtil.success(res, result, '支付成功');
    } catch (error) {
      next(error);
    }
  }

  static async assignOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const operatorId = req.user!.userId;
      const result = await orderService.assignOrder(orderId, req.body, operatorId);
      ResponseUtil.success(res, result, '派单成功');
    } catch (error) {
      next(error);
    }
  }

  static async workerAcceptOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const workerId = req.user!.userId;
      const result = await orderService.workerAcceptOrder(orderId, workerId);
      ResponseUtil.success(res, result, '接单成功');
    } catch (error) {
      next(error);
    }
  }

  static async workerStartService(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const workerId = req.user!.userId;
      const result = await orderService.workerStartService(orderId, workerId);
      ResponseUtil.success(res, result, '开始服务成功');
    } catch (error) {
      next(error);
    }
  }

  static async workerCompleteService(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const workerId = req.user!.userId;
      const result = await orderService.workerCompleteService(orderId, workerId);
      ResponseUtil.success(res, result, '完成服务成功');
    } catch (error) {
      next(error);
    }
  }

  static async customerCancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const customerId = req.user!.userId;
      const { reason } = req.body;
      const result = await orderService.customerCancelOrder(orderId, customerId, reason);
      ResponseUtil.success(res, result, '取消订单成功');
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, status } = req.params;
      const { remark } = req.body;
      const operatorId = req.user!.userId;
      const operatorName = req.user!.username;
      
      const result = await orderService.updateOrderStatus(
        orderId,
        status as OrderStatus,
        operatorId,
        operatorName,
        remark
      );
      ResponseUtil.success(res, result, '更新订单状态成功');
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const result = await orderService.getOrderById(orderId);
      ResponseUtil.success(res, result, '获取订单详情成功');
    } catch (error) {
      next(error);
    }
  }

  static async getOrderStatusHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const result = await orderService.getOrderStatusHistory(orderId);
      ResponseUtil.success(res, result, '获取订单状态历史成功');
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const { status, page = 1, pageSize = 10 } = req.query;
      const result = await orderService.getOrderList(
        customerId,
        undefined,
        status as any,
        Number(page),
        Number(pageSize)
      );
      ResponseUtil.paginated(res, result, '获取订单列表成功');
    } catch (error) {
      next(error);
    }
  }

  static async getWorkerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const workerId = req.user!.userId;
      const { status, page = 1, pageSize = 10 } = req.query;
      const result = await orderService.getOrderList(
        undefined,
        workerId,
        status as any,
        Number(page),
        Number(pageSize)
      );
      ResponseUtil.paginated(res, result, '获取订单列表成功');
    } catch (error) {
      next(error);
    }
  }

  static async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page = 1, pageSize = 10 } = req.query;
      const result = await orderService.getOrderList(
        undefined,
        undefined,
        status as any,
        Number(page),
        Number(pageSize)
      );
      ResponseUtil.paginated(res, result, '获取订单列表成功');
    } catch (error) {
      next(error);
    }
  }

  static async processTimeoutOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { timeoutMinutes = 30 } = req.query;
      const result = await orderService.processTimeoutOrders(Number(timeoutMinutes));
      ResponseUtil.success(res, { processed: result.length, results: result }, '处理超时订单成功');
    } catch (error) {
      next(error);
    }
  }
}

export default OrderController;
