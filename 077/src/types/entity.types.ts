import {
  UserRole,
  UserStatus,
  EquipmentStatus,
  OrderStatus,
  PaymentStatus,
  PaymentType,
  RentalType,
  CategoryStatus,
  CustomerStatus
} from './enum.types';

export interface IUser {
  id: number;
  username: string;
  password?: string;
  realName: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  id: number;
  name: string;
  parentId?: number;
  level: number;
  sort: number;
  icon?: string;
  description?: string;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
  children?: ICategory[];
}

export interface IEquipment {
  id: number;
  equipmentNo: string;
  name: string;
  categoryId: number;
  model: string;
  specification?: string;
  configuration?: string;
  purchaseCost: number;
  purchaseDate: Date;
  dailyPrice: number;
  monthlyPrice: number;
  deposit: number;
  status: EquipmentStatus;
  location?: string;
  maintenanceCycle?: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: ICategory;
}

export interface ICustomer {
  id: number;
  customerNo: string;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  address?: string;
  businessLicense?: string;
  creditLevel?: number;
  creditLimit?: number;
  status: CustomerStatus;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRentalOrder {
  id: number;
  orderNo: string;
  customerId: number;
  equipmentId: number;
  rentalType: RentalType;
  rentalDays?: number;
  rentalMonths?: number;
  startDate: Date;
  endDate: Date;
  actualEndDate?: Date;
  unitPrice: number;
  totalAmount: number;
  deposit: number;
  depositStatus: PaymentStatus;
  rentStatus: PaymentStatus;
  overdueDays: number;
  overdueAmount: number;
  damageAmount: number;
  status: OrderStatus;
  operatorId?: number;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: ICustomer;
  equipment?: IEquipment;
  operator?: IUser;
}

export interface IOrderLog {
  id: number;
  orderId: number;
  operatorId?: number;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  description?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  order?: IRentalOrder;
  operator?: IUser;
}

export interface IPaymentRecord {
  id: number;
  paymentNo: string;
  orderId: number;
  customerId: number;
  paymentType: PaymentType;
  amount: number;
  paymentMethod: string;
  transactionNo?: string;
  remark?: string;
  operatorId?: number;
  createdAt: Date;
  updatedAt: Date;
  order?: IRentalOrder;
  customer?: ICustomer;
  operator?: IUser;
}

export interface IFinancialReport {
  id: number;
  reportDate: string;
  reportType: 'daily' | 'monthly' | 'yearly';
  totalRentIncome: number;
  totalDepositIncome: number;
  totalDepositRefund: number;
  totalOverdueIncome: number;
  totalDamageIncome: number;
  totalMaintenanceCost: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  orderCount: number;
  equipmentCount: number;
  customerCount: number;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOperationLog {
  id: number;
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  url?: string;
  ip?: string;
  params?: string;
  result?: string;
  status: number;
  createdAt: Date;
  user?: IUser;
}
