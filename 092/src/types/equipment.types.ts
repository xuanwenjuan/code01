import { EquipmentStatus } from '../common/enums';

export interface EquipmentFilterParams {
  brand?: string;
  categoryId?: number;
  status?: EquipmentStatus;
  assetNo?: string;
  name?: string;
  minPurchasePrice?: number;
  maxPurchasePrice?: number;
  startPurchaseDate?: string;
  endPurchaseDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface EquipmentScheduleParams {
  equipmentIds: number[];
  startTime: string;
  endTime: string;
  excludeOrderId?: number;
}

export interface CreateEquipmentDto {
  assetNo: string;
  name: string;
  brand: string;
  model: string;
  categoryId: number;
  power?: string;
  specs?: string;
  purchaseDate: Date;
  purchasePrice: number;
  maintenanceCycle: number;
  location?: string;
  remarks?: string;
  depreciationRate?: number;
}

export interface UpdateEquipmentDto extends Partial<CreateEquipmentDto> {
  status?: EquipmentStatus;
}

export interface CreateMaintenanceDto {
  type: string;
  cost?: number;
  description: string;
  performedAt?: Date;
  nextMaintenanceDate?: Date;
  remarks?: string;
}

export interface ScrapEquipmentDto {
  remarks?: string;
}

export interface EquipmentAvailability {
  equipmentId: number;
  equipmentName: string;
  assetNo: string;
  isAvailable: boolean;
  conflictingOrders: {
    orderId: number;
    orderNo: string;
    startTime: Date;
    endTime: Date;
    status: string;
  }[];
}