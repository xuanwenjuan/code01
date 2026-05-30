import { OrderStatus } from '../models/Order';
import { AppError } from '../middlewares/errorHandler';

export const OrderFlowRules: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.UNPAID]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.PACKING, OrderStatus.REFUNDING],
  [OrderStatus.PACKING]: [OrderStatus.SHIPPED, OrderStatus.REFUNDING],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.REFUNDING],
  [OrderStatus.COMPLETED]: [OrderStatus.REFUNDING],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDING]: [OrderStatus.REFUNDED, OrderStatus.PAID],
  [OrderStatus.REFUNDED]: [],
};

export const canTransitionOrderStatus = (currentStatus: OrderStatus, nextStatus: OrderStatus): boolean => {
  const allowedNextStatuses = OrderFlowRules[currentStatus] || [];
  return allowedNextStatuses.includes(nextStatus);
};

export const validateOrderStatusTransition = (currentStatus: OrderStatus, nextStatus: OrderStatus): void => {
  if (!canTransitionOrderStatus(currentStatus, nextStatus)) {
    throw new AppError(
      `订单状态流转失败：无法从 ${getOrderStatusText(currentStatus)} 流转到 ${getOrderStatusText(nextStatus)}`,
      400
    );
  }
};

export const getOrderStatusText = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    [OrderStatus.UNPAID]: '待支付',
    [OrderStatus.PAID]: '已支付',
    [OrderStatus.PACKING]: '配货中',
    [OrderStatus.SHIPPED]: '已发货',
    [OrderStatus.DELIVERED]: '已送达',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDING]: '退款中',
    [OrderStatus.REFUNDED]: '已退款',
  };
  return statusMap[status] || '未知状态';
};

export interface AutoTransitionResult {
  success: boolean;
  newStatus?: OrderStatus;
  message: string;
}

export const autoTransitionAfterPayment = (): AutoTransitionResult => {
  return {
    success: true,
    newStatus: OrderStatus.PAID,
    message: '支付成功，订单已确认',
  };
};

export const autoTransitionAfterDelivery = (): AutoTransitionResult => {
  return {
    success: true,
    newStatus: OrderStatus.DELIVERED,
    message: '订单已送达',
  };
};

export const autoTransitionAfterSign = (): AutoTransitionResult => {
  return {
    success: true,
    newStatus: OrderStatus.COMPLETED,
    message: '订单已签收完成',
  };
};
