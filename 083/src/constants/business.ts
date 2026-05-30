export enum PurchaseOrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  ARRIVED = 'ARRIVED',
  INSPECTED = 'INSPECTED',
  STORED = 'STORED',
  REJECTED = 'REJECTED',
}

export const PurchaseOrderStatusName: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.PENDING]: '待接单',
  [PurchaseOrderStatus.ACCEPTED]: '已接单',
  [PurchaseOrderStatus.ARRIVED]: '已到货',
  [PurchaseOrderStatus.INSPECTED]: '质检完成',
  [PurchaseOrderStatus.STORED]: '已入库',
  [PurchaseOrderStatus.REJECTED]: '已拒绝',
};

export enum OutboundOrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  OUTBOUND = 'OUTBOUND',
  SCRAPPED = 'SCRAPPED',
  RETURNED = 'RETURNED',
}

export const OutboundOrderStatusName: Record<OutboundOrderStatus, string> = {
  [OutboundOrderStatus.PENDING]: '待审批',
  [OutboundOrderStatus.APPROVED]: '已批准',
  [OutboundOrderStatus.OUTBOUND]: '已出库',
  [OutboundOrderStatus.SCRAPPED]: '已报废',
  [OutboundOrderStatus.RETURNED]: '已退回',
};

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export const CategoryStatusName: Record<CategoryStatus, string> = {
  [CategoryStatus.ACTIVE]: '启用',
  [CategoryStatus.DISABLED]: '停用',
};

export enum SupplierStatus {
  COOPERATING = 'COOPERATING',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export const SupplierStatusName: Record<SupplierStatus, string> = {
  [SupplierStatus.COOPERATING]: '合作中',
  [SupplierStatus.SUSPENDED]: '暂停合作',
  [SupplierStatus.TERMINATED]: '终止合作',
};
