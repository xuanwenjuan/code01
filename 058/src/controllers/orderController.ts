import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import { CategoryService } from '../services/categoryService';
import { Result } from '../utils/response';
import { OrderStatus, OrderType } from '../types';

export const calculatePrice = async (req: Request, res: Response) => {
  const { categoryId, distance, weight, isUrgent } = req.query;
  const priceInfo = await CategoryService.calculatePrice(
    Number(categoryId),
    Number(distance),
    weight ? Number(weight) : undefined,
    isUrgent === 'true'
  );
  return Result.sendSuccess(res, priceInfo, '价格计算成功');
};

export const createOrder = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    type, categoryId, title, description, pickupAddress, pickupLat, pickupLng,
    pickupContact, pickupPhone, deliveryAddress, deliveryLat, deliveryLng,
    deliveryContact, deliveryPhone, distance, weight, goodsValue, remark
  } = req.body;

  const order = await OrderService.createOrder(
    userId, type as OrderType, categoryId, title, pickupAddress, pickupContact, pickupPhone,
    deliveryAddress, deliveryContact, deliveryPhone, distance, description,
    pickupLat, pickupLng, deliveryLat, deliveryLng, weight, goodsValue, remark
  );
  return Result.sendSuccess(res, order, '订单创建成功');
};

export const assignOrder = async (req: Request, res: Response) => {
  const { orderId, riderId } = req.body;
  const result = await OrderService.assignOrder(Number(orderId), riderId ? Number(riderId) : undefined);
  return Result.sendSuccess(res, result, '派单成功');
};

export const batchAssignOrders = async (req: Request, res: Response) => {
  const results = await OrderService.batchAssignOrders();
  return Result.sendSuccess(res, results, '批量派单成功');
};

export const acceptOrder = async (req: Request, res: Response) => {
  const riderId = req.user!.id;
  const { orderId } = req.params;
  const order = await OrderService.acceptOrder(riderId, Number(orderId));
  return Result.sendSuccess(res, order, '接单成功');
};

export const pickupOrder = async (req: Request, res: Response) => {
  const riderId = req.user!.id;
  const { orderId, lat, lng } = req.body;
  const order = await OrderService.pickupOrder(riderId, Number(orderId), lat, lng);
  return Result.sendSuccess(res, order, '取件成功');
};

export const deliverOrder = async (req: Request, res: Response) => {
  const riderId = req.user!.id;
  const { orderId, lat, lng } = req.body;
  const order = await OrderService.deliverOrder(riderId, Number(orderId), lat, lng);
  return Result.sendSuccess(res, order, '送达成功');
};

export const completeOrder = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { orderId } = req.params;
  const order = await OrderService.completeOrder(userId, Number(orderId));
  return Result.sendSuccess(res, order, '订单完成');
};

export const cancelOrder = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { orderId, reason } = req.body;
  const order = await OrderService.cancelOrder(userId, Number(orderId), reason);
  return Result.sendSuccess(res, order, '订单取消成功');
};

export const getOrderList = async (req: Request, res: Response) => {
  const { page, pageSize, status, keyword } = req.query;
  const result = await OrderService.getOrderList(
    undefined,
    undefined,
    status as OrderStatus,
    Number(page),
    Number(pageSize),
    keyword as string
  );
  return Result.sendSuccess(res, result, '获取成功');
};

export const getMyOrders = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page, pageSize, status, keyword } = req.query;
  const result = await OrderService.getOrderList(
    userId,
    undefined,
    status as OrderStatus,
    Number(page),
    Number(pageSize),
    keyword as string
  );
  return Result.sendSuccess(res, result, '获取成功');
};

export const getRiderOrders = async (req: Request, res: Response) => {
  const riderId = req.user!.id;
  const { page, pageSize, status, keyword } = req.query;
  const result = await OrderService.getOrderList(
    undefined,
    riderId,
    status as OrderStatus,
    Number(page),
    Number(pageSize),
    keyword as string
  );
  return Result.sendSuccess(res, result, '获取成功');
};

export const getOrderDetail = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await OrderService.getOrderDetail(Number(orderId));
  return Result.sendSuccess(res, order, '获取成功');
};

export const getAvailableOrders = async (req: Request, res: Response) => {
  const { page, pageSize, deliveryArea } = req.query;
  const result = await OrderService.getAvailableOrders(
    Number(page),
    Number(pageSize),
    deliveryArea as string
  );
  return Result.sendSuccess(res, result, '获取成功');
};

export const getOrderStatistics = async (req: Request, res: Response) => {
  const riderId = req.user!.id;
  const { startDate, endDate } = req.query;
  const statistics = await OrderService.getOrderStatistics(
    riderId,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );
  return Result.sendSuccess(res, statistics, '获取成功');
};
