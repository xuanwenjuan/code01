import { RefundStatus, RefundType } from '../models/Refund';
import { AppError } from '../middlewares/errorHandler';

export const RefundFlowRules: Record<RefundStatus, RefundStatus[]> = {
  [RefundStatus.PENDING]: [RefundStatus.APPROVED, RefundStatus.REJECTED],
  [RefundStatus.APPROVED]: [RefundStatus.REFUNDING, RefundStatus.COMPLETED],
  [RefundStatus.REJECTED]: [],
  [RefundStatus.REFUNDING]: [RefundStatus.COMPLETED],
  [RefundStatus.COMPLETED]: [],
};

export const canTransitionRefundStatus = (
  currentStatus: RefundStatus,
  nextStatus: RefundStatus
): boolean => {
  const allowedNextStatuses = RefundFlowRules[currentStatus] || [];
  return allowedNextStatuses.includes(nextStatus);
};

export const validateRefundStatusTransition = (
  currentStatus: RefundStatus,
  nextStatus: RefundStatus
): void => {
  if (!canTransitionRefundStatus(currentStatus, nextStatus)) {
    throw new AppError(
      `退款状态流转失败：无法从 ${getRefundStatusText(currentStatus)} 流转到 ${getRefundStatusText(nextStatus)}`,
      400
    );
  }
};

export const getRefundStatusText = (status: RefundStatus): string => {
  const statusMap: Record<RefundStatus, string> = {
    [RefundStatus.PENDING]: '待审核',
    [RefundStatus.APPROVED]: '审核通过',
    [RefundStatus.REJECTED]: '已拒绝',
    [RefundStatus.REFUNDING]: '退款中',
    [RefundStatus.COMPLETED]: '已完成',
  };
  return statusMap[status] || '未知状态';
};

export const getRefundTypeText = (type: RefundType): string => {
  const typeMap: Record<RefundType, string> = {
    [RefundType.CANCEL_UNSHIPPED]: '未发货取消',
    [RefundType.RETURN_AFTER_DELIVERY]: '已签收退货',
  };
  return typeMap[type] || '未知类型';
};

export interface RefundValidationResult {
  valid: boolean;
  message?: string;
}

export const validateRefundTypeForOrderStatus = (
  orderStatus: string,
  refundType: RefundType
): RefundValidationResult => {
  const validStatusesForType: Record<RefundType, string[]> = {
    [RefundType.CANCEL_UNSHIPPED]: ['paid', 'packing'],
    [RefundType.RETURN_AFTER_DELIVERY]: ['delivered', 'completed'],
  };

  const validStatuses = validStatusesForType[refundType] || [];
  if (!validStatuses.includes(orderStatus)) {
    return {
      valid: false,
      message: `${getRefundTypeText(refundType)} 仅适用于 ${validStatuses.join('/')} 状态的订单`,
    };
  }

  return { valid: true };
};
