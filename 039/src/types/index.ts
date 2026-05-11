export type CustomerCategory = 'enterprise' | 'individual' | 'partner' | 'potential';
export type CustomerLevel = 'A' | 'B' | 'C' | 'D';
export type CustomerStatus = 'not_cooperated' | 'cooperating' | 'lost';
export type OrderStatus = 'pending_payment' | 'shipped' | 'completed' | 'refunded';
export type OperationType = 
  | 'create_customer' 
  | 'update_customer' 
  | 'delete_customer' 
  | 'update_customer_level' 
  | 'create_order' 
  | 'update_order' 
  | 'delete_order' 
  | 'adjust_order_amount' 
  | 'add_follow_up_note' 
  | 'update_performance_target'
  | 'process_large_order';

export type ValueTier = 'ultra_high' | 'high' | 'medium' | 'low';

export interface Customer {
  id: string;
  category: CustomerCategory;
  companyName: string;
  contact: string;
  phone: string;
  level: CustomerLevel;
  status: CustomerStatus;
  createTime: string;
  updateTime: string;
  followUpNotes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  orderNo: string;
  amount: number;
  status: OrderStatus;
  createTime: string;
  updateTime: string;
  isLargeAmount?: boolean;
  processed?: boolean;
}

export interface PerformanceTarget {
  month: string;
  target: number;
  actual: number;
  completionRate: number;
}

export interface OperationLog {
  id: string;
  type: OperationType;
  description: string;
  operator: string;
  operatorId: string;
  targetId: string;
  targetType: 'customer' | 'order' | 'performance';
  oldValue?: string;
  newValue?: string;
  createTime: string;
}

export interface CustomerValue {
  totalOrderAmount: number;
  orderCount: number;
  completedAmount: number;
  avgOrderAmount: number;
  levelMultiplier: number;
  weightedValue: number;
  valueTier: ValueTier;
  lastOrderTime?: string;
}

export interface CustomerFilter {
  category?: CustomerCategory;
  level?: CustomerLevel;
  status?: CustomerStatus;
  keyword?: string;
  minValue?: number;
  maxValue?: number;
  valueTier?: ValueTier;
}

export interface OrderFilter {
  status?: OrderStatus;
  customerId?: string;
  minAmount?: number;
  maxAmount?: number;
  keyword?: string;
}

export interface LogFilter {
  type?: OperationType;
  targetType?: 'customer' | 'order' | 'performance';
  startTime?: string;
  endTime?: string;
  keyword?: string;
}

export interface CustomerWithValue extends Customer {
  valueInfo: CustomerValue;
}

export interface MenuItemType {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface CustomerModalFormValues {
  category: CustomerCategory;
  companyName: string;
  contact: string;
  phone: string;
  level: CustomerLevel;
  status: CustomerStatus;
}

export interface OrderModalFormValues {
  customerId: string;
  amount: number;
  status: OrderStatus;
}

export interface NoteFormValues {
  note: string;
}

export interface LevelFormValues {
  level: CustomerLevel;
}

export interface AmountFormValues {
  amount: number;
}

export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
  color?: string;
};

export type OrderStatusFlow = Record<OrderStatus, OrderStatus[]>;

export interface OrderStatusTransition {
  from: OrderStatus;
  to: OrderStatus;
  label: string;
  icon: React.ReactNode;
}

export interface ValueStats {
  totalValue: number;
  avgValue: number;
  highValueCount: number;
  ultraHighCount: number;
  totalCustomers: number;
}
