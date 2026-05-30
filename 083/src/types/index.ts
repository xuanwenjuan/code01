import { RoleCode } from '../constants/role';
import { CategoryStatus, SupplierStatus, PurchaseOrderStatus, OutboundOrderStatus } from '../constants/business';
import { StockLogType } from '../models/stockLog.model';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthUser {
  id: number;
  username: string;
  roleCode: RoleCode;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: number;
  sort?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parentId?: number;
  sort?: number;
  status?: CategoryStatus;
}

export interface CreateSupplierDto {
  name: string;
  code: string;
  brand?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  qualification?: string;
  qualificationExpiryDate?: Date;
  supplyCategories?: string;
  supplyCycle?: number;
  paymentTerm?: string;
  remark?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  code?: string;
  brand?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  qualification?: string;
  qualificationExpiryDate?: Date;
  supplyCategories?: string;
  supplyCycle?: number;
  paymentTerm?: string;
  status?: SupplierStatus;
  remark?: string;
}

export interface CreatePartDto {
  code: string;
  name: string;
  specification?: string;
  vehicleModel?: string;
  categoryId: number;
  supplierId?: number;
  unitPrice: number;
  unit?: string;
  safeStock?: number;
  remark?: string;
}

export interface UpdatePartDto {
  code?: string;
  name?: string;
  specification?: string;
  vehicleModel?: string;
  categoryId?: number;
  supplierId?: number;
  unitPrice?: number;
  unit?: string;
  safeStock?: number;
  remark?: string;
}

export interface PurchaseOrderItemDto {
  partId: number;
  quantity: number;
  unitPrice: number;
  remark?: string;
}

export interface CreatePurchaseOrderDto {
  supplierId: number;
  expectedDate?: Date;
  remark?: string;
  items: PurchaseOrderItemDto[];
}

export interface UpdatePurchaseOrderDto {
  supplierId?: number;
  expectedDate?: Date;
  remark?: string;
  items?: PurchaseOrderItemDto[];
}

export interface InspectItemDto {
  id: number;
  qualifiedQuantity: number;
}

export interface InspectOrderDto {
  inspectorId?: number;
  items: InspectItemDto[];
  remark?: string;
}

export interface InboundItemDto {
  id: number;
  batchNo: string;
  warehouseLocation?: string;
}

export interface InboundOrderDto {
  items: InboundItemDto[];
}

export interface OutboundOrderItemDto {
  partId: number;
  quantity: number;
  unitPrice: number;
  remark?: string;
}

export interface CreateOutboundOrderDto {
  repairOrderNo?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  remark?: string;
  items: OutboundOrderItemDto[];
}

export interface ScrapItemDto {
  id: number;
  quantity: number;
  reason?: string;
}

export interface ScrapPartsDto {
  items: ScrapItemDto[];
}

export interface ReturnItemDto {
  id: number;
  quantity: number;
  batchNo: string;
  reason?: string;
}

export interface ReturnPartsDto {
  items: ReturnItemDto[];
}

export interface AdjustStockDto {
  partId: number;
  quantity: number;
  remark?: string;
}

export interface OperationLogQueryParams extends PaginationParams {
  module?: string;
  operation?: string;
  operatorId?: number;
  targetId?: number;
  startDate?: string;
  endDate?: string;
}

export interface ConsumptionLogQueryParams extends PaginationParams {
  partId?: number;
  categoryId?: number;
  technicianId?: number;
  vehiclePlate?: string;
  repairOrderNo?: string;
  startDate?: string;
  endDate?: string;
}

export interface ConsumptionStatisticsParams {
  startDate: string;
  endDate: string;
  categoryId?: number;
  technicianId?: number;
  groupBy?: 'category' | 'technician' | 'vehicle';
}

export interface CategoryListQueryParams extends PaginationParams {
  name?: string;
  status?: CategoryStatus;
}

export interface SupplierListQueryParams extends PaginationParams {
  name?: string;
  code?: string;
  brand?: string;
  supplyCategory?: string;
  status?: SupplierStatus;
  qualificationExpiring?: boolean;
}

export interface PartListQueryParams extends PaginationParams {
  code?: string;
  name?: string;
  categoryId?: number;
  supplierId?: number;
  lowStock?: boolean;
}

export interface PurchaseOrderListQueryParams extends PaginationParams {
  orderNo?: string;
  supplierId?: number;
  status?: PurchaseOrderStatus;
}

export interface OutboundOrderListQueryParams extends PaginationParams {
  orderNo?: string;
  technicianId?: number;
  status?: OutboundOrderStatus;
  vehiclePlate?: string;
  startDate?: string;
  endDate?: string;
}

export interface StockListQueryParams extends PaginationParams {
  partId?: number;
  supplierId?: number;
  batchNo?: string;
}

export interface StockLogListQueryParams extends PaginationParams {
  partId?: number;
  type?: StockLogType;
  startDate?: string;
  endDate?: string;
}
