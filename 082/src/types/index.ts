import { UserRole, RoomStatus, OrderStatus, SeasonType } from '../constants';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserEntity {
  id: number;
  username: string;
  realName: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  status: boolean;
  lastLoginTime?: Date;
  lastLoginIp?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomCategoryEntity {
  id: number;
  name: string;
  parentId?: number;
  level: number;
  sort: number;
  description?: string;
  status: boolean;
  icon?: string;
  children?: RoomCategoryEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomEntity {
  id: number;
  roomNo: string;
  categoryId: number;
  building: string;
  floor: string;
  bedCount: number;
  maxGuests: number;
  area: number;
  facilities: string;
  images?: string;
  peakPrice: number;
  normalPrice: number;
  lowPrice: number;
  status: RoomStatus;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  description?: string;
  category?: RoomCategoryEntity;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomFilterParams {
  page?: number;
  pageSize?: number;
  building?: string;
  categoryId?: number;
  minGuests?: number;
  maxGuests?: number;
  minPrice?: number;
  maxPrice?: number;
  facilities?: string[];
  status?: RoomStatus;
  checkInDate?: string;
  checkOutDate?: string;
  keyword?: string;
}

export interface OrderEntity {
  id: number;
  orderNo: string;
  userId: number;
  roomId: number;
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  seasonType: SeasonType;
  dailyPrice: number;
  totalDays: number;
  totalAmount: number;
  depositAmount: number;
  paidAmount: number;
  extraAmount: number;
  status: OrderStatus;
  paidTime?: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  cancelTime?: Date;
  remark?: string;
  room?: RoomEntity;
  user?: UserEntity;
  statusLogs?: OrderStatusLogEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderStatusLogEntity {
  id: number;
  orderId: number;
  orderNo: string;
  previousStatus?: OrderStatus;
  currentStatus: OrderStatus;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderParams {
  roomId: number;
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  remark?: string;
}

export interface CheckOutParams {
  extraCharges?: ExtraChargeItem[];
  remark?: string;
}

export interface ExtraChargeItem {
  name: string;
  amount: number;
  quantity?: number;
  remark?: string;
}

export interface RevenueReportEntity {
  id: number;
  reportDate: Date;
  building?: string;
  categoryId?: number;
  seasonType?: SeasonType;
  totalOrders: number;
  checkInCount: number;
  checkOutCount: number;
  occupancyRate: number;
  totalRevenue: number;
  maintenanceCost: number;
  netProfit: number;
  avgDailyRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationLogEntity {
  id: number;
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  params?: string;
  ip?: string;
  status: boolean;
  errorMsg?: string;
  duration: number;
  createdAt: Date;
}
