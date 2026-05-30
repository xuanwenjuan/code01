import { DistributorType, DistributorStatus, DistributorLevel } from '../database/models/distributor.model';
import { OrderStatus } from '../database/models/order.model';
import { TicketStatus } from '../database/models/ticket.model';
import { SettlementStatus } from '../database/models/settlement.model';
import { CommissionTierType } from '../database/models/commissionTier.model';
import { OperationType } from '../database/models/operationLog.model';
import { UserRole } from './common';

export interface IBaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IUser extends IBaseEntity {
  username: string;
  role: UserRole;
  distributorId?: number;
  realName?: string;
  phone?: string;
  enabled: boolean;
}

export interface IDistributor extends IBaseEntity {
  name: string;
  type: DistributorType;
  level: DistributorLevel;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
  baseCommissionRate: number;
  commissionRate: number;
  totalSales: number;
  monthlySales: number;
  totalOrders: number;
  creditLimit: number;
  status: DistributorStatus;
  effectiveDate?: Date;
  terminationDate?: Date;
  remark?: string;
}

export interface IProductCategory extends IBaseEntity {
  name: string;
  type: string;
  parentId?: number;
  sortOrder: number;
  enabled: boolean;
  remark?: string;
}

export interface IOrder extends IBaseEntity {
  orderNo: string;
  distributorId?: number;
  visitorName: string;
  visitorPhone: string;
  idCard?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  commissionAmount: number;
  status: OrderStatus;
  paidAt?: Date;
  expireAt?: Date;
  remark?: string;
}

export interface ITicket extends IBaseEntity {
  orderId: number;
  ticketCode: string;
  productName: string;
  price: number;
  status: TicketStatus;
  expireAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: number;
  verifierName?: string;
}

export interface ISettlement extends IBaseEntity {
  settlementNo: string;
  distributorId: number;
  period: string;
  totalOrders: number;
  totalAmount: number;
  commissionAmount: number;
  status: SettlementStatus;
  confirmedAt?: Date;
  confirmedBy?: number;
  paidAt?: Date;
  paidBy?: number;
  paidAmount?: number;
  remark?: string;
}

export interface ICommissionTier extends IBaseEntity {
  distributorId?: number;
  name: string;
  tierType: CommissionTierType;
  minThreshold: number;
  maxThreshold?: number;
  commissionRate: number;
  sortOrder: number;
  enabled: boolean;
  remark?: string;
}

export interface IOperationLog extends IBaseEntity {
  operatorId?: number;
  operatorName?: string;
  module: string;
  operation: OperationType;
  description: string;
  ip?: string;
  requestParams?: string;
  responseResult?: string;
}
