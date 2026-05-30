import { PaginationParams } from './common';

export enum VehicleStatus {
  IDLE = 'idle',
  IN_TRANSIT = 'in_transit',
  MAINTENANCE = 'maintenance'
}

export interface VehicleBase {
  plateNumber: string;
  vehicleType: string;
  loadCapacity: number;
  loadVolume?: number;
  driverName: string;
  driverPhone: string;
  driverIdCard?: string;
  operatingLicense: string;
  licenseExpireDate: Date;
  branchId: number;
  currentLocation?: string;
  remark?: string;
}

export interface Vehicle extends VehicleBase {
  id: number;
  status: VehicleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleCreateInput extends Omit<VehicleBase, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

export interface VehicleUpdateInput extends Partial<VehicleCreateInput> {
  status?: VehicleStatus;
}

export interface VehicleListParams extends PaginationParams {
  branchId?: number;
  status?: VehicleStatus;
  vehicleType?: string;
  vehicleTypes?: string[];
  minLoadCapacity?: number;
  maxLoadCapacity?: number;
  minLoadVolume?: number;
  maxLoadVolume?: number;
  keyword?: string;
}

export interface VehicleStats {
  total: number;
  idle: number;
  inTransit: number;
  maintenance: number;
  expiring: number;
  utilizationRate: string;
}

export interface StatusTransition {
  from: VehicleStatus;
  to: VehicleStatus;
  allowed: boolean;
}
