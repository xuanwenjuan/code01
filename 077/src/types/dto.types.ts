import {
  UserRole,
  EquipmentStatus,
  RentalType,
  CategoryStatus,
  CustomerStatus
} from './enum.types';

export interface ICreateUserDto {
  username: string;
  password: string;
  realName: string;
  phone: string;
  email?: string;
  role: UserRole;
}

export interface IUpdateUserDto {
  realName?: string;
  phone?: string;
  email?: string;
  role?: UserRole;
  status?: number;
}

export interface ICreateCategoryDto {
  name: string;
  parentId?: number;
  sort?: number;
  icon?: string;
  description?: string;
}

export interface IUpdateCategoryDto {
  name?: string;
  parentId?: number;
  sort?: number;
  icon?: string;
  description?: string;
  status?: CategoryStatus;
}

export interface ICreateEquipmentDto {
  name: string;
  categoryId: number;
  model: string;
  specification?: string;
  configuration?: string;
  purchaseCost: number;
  purchaseDate?: Date;
  dailyPrice: number;
  monthlyPrice: number;
  deposit: number;
  location?: string;
  maintenanceCycle?: number;
  remark?: string;
}

export interface IUpdateEquipmentDto {
  name?: string;
  categoryId?: number;
  model?: string;
  specification?: string;
  configuration?: string;
  purchaseCost?: number;
  purchaseDate?: Date;
  dailyPrice?: number;
  monthlyPrice?: number;
  deposit?: number;
  location?: string;
  maintenanceCycle?: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  remark?: string;
}

export interface IEquipmentFilterDto {
  name?: string;
  equipmentNo?: string;
  categoryId?: number;
  status?: EquipmentStatus;
  minDailyPrice?: number;
  maxDailyPrice?: number;
  minMonthlyPrice?: number;
  maxMonthlyPrice?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface ICreateCustomerDto {
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  address?: string;
  businessLicense?: string;
  creditLevel?: number;
  creditLimit?: number;
  remark?: string;
}

export interface IUpdateCustomerDto {
  companyName?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  businessLicense?: string;
  creditLevel?: number;
  creditLimit?: number;
  status?: CustomerStatus;
  remark?: string;
}

export interface ICreateOrderDto {
  customerId: number;
  equipmentId: number;
  rentalType: RentalType;
  rentalDays?: number;
  rentalMonths?: number;
  startDate: Date;
  endDate: Date;
  remark?: string;
}

export interface IUpdateOrderDto {
  startDate?: Date;
  endDate?: Date;
  remark?: string;
}

export interface ICancelOrderDto {
  reason?: string;
}

export interface IPayDepositDto {
  amount: number;
  paymentMethod: string;
  transactionNo?: string;
  remark?: string;
}

export interface IReturnEquipmentDto {
  damageAmount?: number;
  damageDescription?: string;
  remark?: string;
}

export interface IPayRentDto {
  amount: number;
  paymentMethod: string;
  transactionNo?: string;
  remark?: string;
}

export interface IOrderFilterDto {
  orderNo?: string;
  customerId?: number;
  equipmentId?: number;
  status?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  page?: number;
  pageSize?: number;
}

export interface IGenerateReportDto {
  year: number;
  month?: number;
  type: 'daily' | 'monthly' | 'yearly';
}

export interface ILoginDto {
  username: string;
  password: string;
}

export interface IChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface IBatchUpdateStatusDto {
  ids: number[];
  status: number;
  remark?: string;
}
