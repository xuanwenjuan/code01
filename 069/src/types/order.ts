import { PaginationParams, DateRangeParams } from './common';

export enum OrderStatus {
  PENDING = 'pending',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  TRANSFERRING = 'transferring',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  SIGNED = 'signed',
  ABNORMAL = 'abnormal',
  CANCELLED = 'cancelled'
}

export interface OrderBase {
  orderNo: string;
  shipperName: string;
  shipperPhone: string;
  shipperAddress: string;
  shipperBranchId?: number;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverBranchId?: number;
  goodsName: string;
  goodsWeight: number;
  goodsVolume?: number;
  goodsQuantity: number;
  freightAmount: number;
  insuranceAmount?: number;
  totalAmount: number;
  paymentMethod: string;
  vehicleId?: number;
  currentBranchId?: number;
  remark?: string;
  operatorId?: number;
}

export interface Order extends OrderBase {
  id: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderCreateInput extends Omit<OrderBase, 'id' | 'orderNo' | 'status' | 'createdAt' | 'updatedAt'> {}

export interface OrderUpdateInput extends Partial<Omit<OrderCreateInput, 'operatorId'>> {
  operatorId?: number;
}

export interface OrderListParams extends PaginationParams, DateRangeParams {
  status?: OrderStatus;
  shipperBranchId?: number;
  receiverBranchId?: number;
  vehicleId?: number;
  keyword?: string;
}

export interface OrderLog {
  id: number;
  orderId: number;
  status: string;
  description: string;
  operatorId?: number;
  operatorName?: string;
  location?: string;
  remark?: string;
  createdAt: Date;
}

export interface OrderStatistics {
  pending: number;
  pickedUp: number;
  inTransit: number;
  transferring: number;
  delivering: number;
  delivered: number;
  signed: number;
  abnormal: number;
  cancelled: number;
  total: number;
  totalFreight: number;
  totalInsurance: number;
  totalWeight: number;
}

export interface StatusTransition {
  from: OrderStatus;
  to: OrderStatus;
  allowed: boolean;
}
