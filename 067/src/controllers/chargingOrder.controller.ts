import { Request, Response } from 'express';
import chargingOrderService from '../services/chargingOrder.service';
import { ResponseUtil } from '../utils/response';
import { OrderStatus, UserRole } from '../types';

export const startCharging = async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      userId: req.user?.id,
    };
    const order = await chargingOrderService.startCharging(data);
    res.json(ResponseUtil.success(order, '开始充电成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const endCharging = async (req: Request, res: Response) => {
  try {
    const order = await chargingOrderService.endCharging(Number(req.params.id), req.body);
    res.json(ResponseUtil.success(order, '结束充电成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const order = await chargingOrderService.getById(Number(req.params.id));
    res.json(ResponseUtil.success(order));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getList = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, userId, siteId, pileId, status, startDate, endDate, keyword } = req.query;
    const result = await chargingOrderService.getList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      userId: userId ? Number(userId) : req.user?.role !== UserRole.USER ? undefined : req.user?.id,
      siteId: siteId ? Number(siteId) : undefined,
      pileId: pileId ? Number(pileId) : undefined,
      status: status as OrderStatus,
      startDate: startDate as string,
      endDate: endDate as string,
      keyword: keyword as string,
    });
    res.json(ResponseUtil.success(result));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const pauseCharging = async (req: Request, res: Response) => {
  try {
    const order = await chargingOrderService.pauseCharging(Number(req.params.id), req.user?.id);
    res.json(ResponseUtil.success(order, '暂停充电成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const resumeCharging = async (req: Request, res: Response) => {
  try {
    const order = await chargingOrderService.resumeCharging(Number(req.params.id), req.user?.id);
    res.json(ResponseUtil.success(order, '继续充电成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const markAbnormal = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const order = await chargingOrderService.markAbnormal(Number(req.params.id), reason, req.user?.id);
    res.json(ResponseUtil.success(order, '标记异常成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const handleAbnormalOrder = async (req: Request, res: Response) => {
  try {
    const order = await chargingOrderService.handleAbnormalOrder(Number(req.params.id), {
      ...req.body,
      operatorId: req.user?.id,
    });
    res.json(ResponseUtil.success(order, '异常订单处理成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const order = await chargingOrderService.cancelOrder(Number(req.params.id), req.user?.id);
    res.json(ResponseUtil.success(order, '取消成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const processTimeoutOrders = async (req: Request, res: Response) => {
  try {
    const { timeoutMinutes } = req.body;
    const result = await chargingOrderService.processTimeoutOrders(timeoutMinutes);
    res.json(ResponseUtil.success(result, '超时订单处理完成'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const { siteId, startDate, endDate } = req.query;
    const stats = await chargingOrderService.getStatistics({
      siteId: siteId ? Number(siteId) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(ResponseUtil.success(stats));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getOrderTrend = async (req: Request, res: Response) => {
  try {
    const { days, siteId } = req.query;
    const trend = await chargingOrderService.getOrderTrend({
      days: days ? Number(days) : undefined,
      siteId: siteId ? Number(siteId) : undefined,
    });
    res.json(ResponseUtil.success(trend));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};
