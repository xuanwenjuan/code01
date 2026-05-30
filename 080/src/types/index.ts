export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

export interface EquipmentFilterParams {
  status?: string;
  categoryId?: number;
  brand?: string;
  manufactureYear?: number;
  minYear?: number;
  maxYear?: number;
  conditionLevel?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sellerId?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface AuctionFilterParams {
  status?: string;
  categoryId?: number;
  sellerId?: number;
  keyword?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface OrderFilterParams {
  status?: string;
  buyerId?: number;
  sellerId?: number;
  startDate?: string;
  endDate?: string;
}

export interface CommissionFilterParams {
  status?: string;
  settlementMonth?: string;
  sellerId?: number;
  startMonth?: string;
  endMonth?: string;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

export interface CreateAuctionParams {
  equipmentId: number;
  startPrice: number;
  reservePrice?: number;
  bidIncrement: number;
  startTime: Date;
  endTime: Date;
  extendTime?: number;
}

export interface CreateOrderParams {
  auctionId: number;
  equipmentId: number;
  buyerId: number;
  sellerId: number;
  finalPrice: number;
}

export interface CommissionTier {
  minAmount: number;
  maxAmount?: number;
  rate: number;
}

export interface CreateCommissionParams {
  orderId: number;
  sellerId: number;
  categoryId: number;
  transactionAmount: number;
  commissionRate: number;
  commissionAmount: number;
  settlementMonth: string;
}
