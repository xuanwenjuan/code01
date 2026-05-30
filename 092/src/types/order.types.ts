import { OrderStatus, PaymentStatus } from '../common/enums';

export interface OrderFilterParams {
  status?: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: number;
  paymentStatus?: PaymentStatus;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface OrderItemDto {
  equipmentId: number;
  quantity: number;
  unitPrice: number;
  remarks?: string;
}

export interface CreateOrderDto {
  eventName: string;
  eventLocation: string;
  startTime: Date;
  endTime: Date;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  depositAmount: number;
  items: OrderItemDto[];
  remarks?: string;
}

export interface UpdateOrderDto {
  eventName?: string;
  eventLocation?: string;
  startTime?: Date;
  endTime?: Date;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  depositAmount?: number;
  remarks?: string;
}

export interface ConfirmOrderDto {
  paidAmount?: number;
  paymentMethod?: string;
  remarks?: string;
}

export interface ReturnOrderItemDto {
  orderItemId: number;
  returnedQuantity: number;
  damagedQuantity: number;
  damageLevel?: 'minor' | 'moderate' | 'severe' | 'total';
  damageDescription?: string;
}

export interface ReturnOrderDto {
  returnItems: ReturnOrderItemDto[];
  remarks?: string;
}

export interface CancelOrderDto {
  cancelReason: string;
}

export interface PaymentRecordDto {
  amount: number;
  paymentMethod?: string;
  remarks?: string;
}

export interface UpdateOrderItemDto {
  quantity?: number;
  unitPrice?: number;
  remarks?: string;
}

export interface OrderStatistics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  paidAmount: number;
  unpaidAmount: number;
  byStatus: {
    status: OrderStatus;
    count: number;
    amount: number;
  }[];
}