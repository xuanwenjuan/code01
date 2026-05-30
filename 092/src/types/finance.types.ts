export interface RevenueStatisticsParams {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'month' | 'year';
}

export interface RevenueStatisticsItem {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface CategoryStatisticsItem {
  categoryId: number;
  categoryName: string;
  revenue: number;
  rentalCount: number;
}

export interface EquipmentUtilizationItem {
  equipmentId: number;
  assetNo: string;
  equipmentName: string;
  category: string;
  totalDays: number;
  rentedDays: number;
  utilizationRate: number;
}

export interface CustomerStatisticsItem {
  customerName: string;
  customerPhone: string;
  totalRevenue: number;
  orderCount: number;
}

export interface SalespersonStatisticsItem {
  userId: number;
  username: string;
  realName: string;
  totalRevenue: number;
  orderCount: number;
}

export interface DamageStatisticsItem {
  orderItemId: number;
  orderId: number;
  orderNo: string;
  customerName: string;
  equipmentId: number;
  equipmentName: string;
  assetNo: string;
  quantity: number;
  damagedQuantity: number;
  damageAmount: number;
  remarks?: string;
}

export interface PaymentStatisticsItem {
  paymentStatus: string;
  totalAmount: number;
  paidAmount: number;
  orderCount: number;
}

export interface SummaryStatistics {
  totalRevenue: number;
  totalPaidAmount: number;
  totalUnpaidAmount: number;
  totalOrders: number;
  completedOrders: number;
  completionRate: number;
  totalEquipments: number;
  inUseEquipments: number;
  equipmentUtilization: number;
  totalDamageAmount: number;
}