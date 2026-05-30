import { IPaginationParams, IPaginationResult } from './common';
import { IDistributor, IOrder, ITicket, ISettlement, ICommissionTier, IProductCategory, IUser } from './entities';

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
    realName?: string;
  };
}

export interface ICreateDistributorRequest {
  name: string;
  type: string;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
  baseCommissionRate: number;
  creditLimit?: number;
  effectiveDate?: string;
  terminationDate?: string;
  remark?: string;
}

export interface IUpdateDistributorRequest extends Partial<ICreateDistributorRequest> {
  status?: string;
}

export interface IDistributorListRequest extends IPaginationParams {
  type?: string;
  status?: string;
  keyword?: string;
}

export interface ICreateOrderRequest {
  distributorId?: number;
  visitorName: string;
  visitorPhone: string;
  idCard?: string;
  quantity: number;
  unitPrice: number;
  productName?: string;
  expireAt?: string;
  remark?: string;
}

export interface IOrderListRequest extends IPaginationParams {
  distributorId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface IVerifyTicketRequest {
  ticketCode: string;
}

export interface IBatchVerifyTicketRequest {
  ticketCodes: string[];
}

export interface ITicketListRequest extends IPaginationParams {
  orderId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface ICreateSettlementRequest {
  distributorId: number;
  period: string;
}

export interface IPaySettlementRequest {
  paidAmount: number;
}

export interface ISettlementListRequest extends IPaginationParams {
  distributorId?: number;
  status?: string;
  period?: string;
}

export interface ICreateCommissionTierRequest {
  distributorId?: number;
  name: string;
  tierType: string;
  minThreshold: number;
  maxThreshold?: number;
  commissionRate: number;
  sortOrder?: number;
  enabled?: boolean;
  remark?: string;
}

export interface IUpdateCommissionTierRequest extends Partial<ICreateCommissionTierRequest> {}

export interface ICommissionTierListRequest extends IPaginationParams {
  distributorId?: number;
  tierType?: string;
  enabled?: boolean;
}

export interface ICreateProductCategoryRequest {
  name: string;
  type: string;
  parentId?: number;
  sortOrder?: number;
  enabled?: boolean;
  remark?: string;
}

export interface IUpdateProductCategoryRequest extends Partial<ICreateProductCategoryRequest> {}

export interface IProductCategoryListRequest {
  type?: string;
  parentId?: number;
  enabled?: boolean;
}

export interface IUpdateCategorySortOrderRequest {
  ids: number[];
}

export interface ICreateUserRequest {
  username: string;
  password: string;
  role: string;
  distributorId?: number;
  realName?: string;
  phone?: string;
  enabled?: boolean;
}

export interface IUpdateUserRequest extends Partial<ICreateUserRequest> {
  password?: string;
}

export interface IUserListRequest extends IPaginationParams {
  role?: string;
  enabled?: boolean;
  keyword?: string;
}

export type ApiResponse<T = any> = {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
};

export type DistributorListResponse = ApiResponse<IPaginationResult<IDistributor>>;
export type OrderListResponse = ApiResponse<IPaginationResult<IOrder>>;
export type TicketListResponse = ApiResponse<IPaginationResult<ITicket>>;
export type SettlementListResponse = ApiResponse<IPaginationResult<ISettlement>>;
export type CommissionTierListResponse = ApiResponse<IPaginationResult<ICommissionTier>>;
export type ProductCategoryListResponse = ApiResponse<IPaginationResult<IProductCategory>>;
export type UserListResponse = ApiResponse<IPaginationResult<IUser>>;
