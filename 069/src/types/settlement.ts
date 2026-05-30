import { PaginationParams, DateRangeParams } from './common';

export enum SettlementStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  CANCELLED = 'cancelled'
}

export enum SettlementType {
  LINE = 'line',
  VEHICLE = 'vehicle',
  BRANCH = 'branch'
}

export interface SettlementBase {
  settlementNo: string;
  type: SettlementType;
  branchId?: number;
  vehicleId?: number;
  startDate: Date;
  endDate: Date;
  totalOrders: number;
  totalFreight: number;
  totalInsurance: number;
  branchCommission: number;
  driverFreight: number;
  platformFee: number;
  insuranceShare: number;
  otherCosts: number;
  netAmount: number;
  remark?: string;
  operatorId?: number;
}

export interface Settlement extends SettlementBase {
  id: number;
  status: SettlementStatus;
  settledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettlementCreateInput extends Omit<SettlementBase, 'id' | 'settlementNo' | 'status' | 'settledAt' | 'createdAt' | 'updatedAt'> {}

export interface SettlementItem {
  id: number;
  settlementId: number;
  orderId: number;
  orderNo: string;
  freightAmount: number;
  insuranceAmount?: number;
  branchCommission: number;
  driverFreight: number;
  platformFee: number;
  insuranceShare: number;
  netAmount: number;
  remark?: string;
}

export interface SettlementListParams extends PaginationParams, DateRangeParams {
  type?: SettlementType;
  status?: SettlementStatus;
  branchId?: number;
  vehicleId?: number;
  keyword?: string;
}

export interface SettlementPreviewInput {
  type: SettlementType;
  branchId?: number;
  vehicleId?: number;
  startDate: string;
  endDate: string;
  otherCosts?: number;
}

export interface SettlementPreview {
  totalOrders: number;
  totalFreight: number;
  totalInsurance: number;
  branchCommission: number;
  driverFreight: number;
  platformFee: number;
  insuranceShare: number;
  otherCosts: number;
  netAmount: number;
  sampleOrders: Array<{
    id: number;
    orderNo: string;
    freightAmount: number;
    insuranceAmount?: number;
    goodsName: string;
    createdAt: Date;
  }>;
}

export interface SettlementStatistics {
  pending: number;
  settled: number;
  cancelled: number;
  total: number;
  totalFreight: number;
  totalBranchCommission: number;
  totalDriverFreight: number;
  totalOtherCosts: number;
  totalNetAmount: number;
}
