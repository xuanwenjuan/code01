import { OrderStatus } from '../types';
import { BadRequestException } from '../exceptions/HttpException';

export interface StateTransition {
  from: OrderStatus | null;
  to: OrderStatus;
  allowedRoles: string[];
  description: string;
}

export const stateTransitions: StateTransition[] = [
  {
    from: null,
    to: OrderStatus.PENDING_PAYMENT,
    allowedRoles: ['customer', 'super_admin'],
    description: '创建订单'
  },
  {
    from: OrderStatus.PENDING_PAYMENT,
    to: OrderStatus.PAID,
    allowedRoles: ['customer', 'super_admin'],
    description: '支付订单'
  },
  {
    from: OrderStatus.PENDING_PAYMENT,
    to: OrderStatus.CANCELLED,
    allowedRoles: ['customer', 'super_admin', 'store_manager'],
    description: '取消订单'
  },
  {
    from: OrderStatus.PENDING_PAYMENT,
    to: OrderStatus.TIMEOUT_CLOSED,
    allowedRoles: ['system'],
    description: '超时自动关闭'
  },
  {
    from: OrderStatus.PAID,
    to: OrderStatus.MAKING,
    allowedRoles: ['super_admin', 'store_manager', 'store_staff'],
    description: '开始制作'
  },
  {
    from: OrderStatus.PAID,
    to: OrderStatus.CANCELLED,
    allowedRoles: ['customer', 'super_admin', 'store_manager'],
    description: '取消订单（退款）'
  },
  {
    from: OrderStatus.MAKING,
    to: OrderStatus.READY,
    allowedRoles: ['super_admin', 'store_manager', 'store_staff'],
    description: '制作完成，待配送'
  },
  {
    from: OrderStatus.READY,
    to: OrderStatus.DELIVERING,
    allowedRoles: ['super_admin', 'store_manager'],
    description: '分配骑手，开始配送'
  },
  {
    from: OrderStatus.DELIVERING,
    to: OrderStatus.DELIVERED,
    allowedRoles: ['super_admin', 'delivery_rider'],
    description: '配送完成，待确认'
  },
  {
    from: OrderStatus.DELIVERED,
    to: OrderStatus.COMPLETED,
    allowedRoles: ['customer', 'super_admin'],
    description: '订单已完成'
  },
  {
    from: OrderStatus.DELIVERED,
    to: OrderStatus.CANCELLED,
    allowedRoles: ['super_admin', 'store_manager'],
    description: '订单取消（拒收）'
  }
];

export const canTransition = (
  currentStatus: OrderStatus | null,
  targetStatus: OrderStatus,
  userRole: string
): boolean => {
  return stateTransitions.some(
    t => t.from === currentStatus && t.to === targetStatus && t.allowedRoles.includes(userRole)
  );
};

export const validateTransition = (
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
  userRole: string
): void => {
  if (!canTransition(currentStatus, targetStatus, userRole)) {
    throw new BadRequestException(
      `无法从状态 ${currentStatus} 转换到 ${targetStatus}，当前角色 ${userRole} 无权限执行此操作`
    );
  }
};

export const getNextAllowedStates = (
  currentStatus: OrderStatus,
  userRole: string
): OrderStatus[] => {
  return stateTransitions
    .filter(t => t.from === currentStatus && t.allowedRoles.includes(userRole))
    .map(t => t.to);
};

export const getTransitionDescription = (
  fromStatus: OrderStatus | null,
  toStatus: OrderStatus
): string | null => {
  const transition = stateTransitions.find(t => t.from === fromStatus && t.to === toStatus);
  return transition ? transition.description : null;
};

export const isTerminalState = (status: OrderStatus): boolean => {
  return [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.TIMEOUT_CLOSED
  ].includes(status);
};
