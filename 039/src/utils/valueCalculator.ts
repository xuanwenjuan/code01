import type { Customer, Order, CustomerValue, ValueTier, CustomerLevel } from '@/types';

export const CUSTOMER_LEVEL_MULTIPLIERS: Record<CustomerLevel, number> = {
  A: 2.0,
  B: 1.5,
  C: 1.0,
  D: 0.7
};

export const VALUE_TIER_THRESHOLDS: Record<ValueTier, number> = {
  ultra_high: 500000,
  high: 200000,
  medium: 50000,
  low: 0
};

export const VALUE_TIER_LABELS: Record<ValueTier, { label: string; color: string }> = {
  ultra_high: { label: '超高价值', color: '#ff4d4f' },
  high: { label: '高价值', color: '#faad14' },
  medium: { label: '中价值', color: '#1890ff' },
  low: { label: '低价值', color: '#999999' }
};

export const calculateCustomerValue = (
  customer: Customer,
  orders: Order[]
): CustomerValue => {
  const customerOrders = orders.filter((order: Order) => order.customerId === customer.id);
  const completedOrders = customerOrders.filter((order: Order) => order.status === 'completed');
  
  const totalOrderAmount = customerOrders.reduce((sum, order) => sum + order.amount, 0);
  const completedAmount = completedOrders.reduce((sum, order) => sum + order.amount, 0);
  const orderCount = customerOrders.length;
  const avgOrderAmount = orderCount > 0 ? totalOrderAmount / orderCount : 0;
  const levelMultiplier = CUSTOMER_LEVEL_MULTIPLIERS[customer.level];
  const weightedValue = completedAmount * levelMultiplier;

  const lastOrder = customerOrders.length > 0
    ? customerOrders.reduce((latest, order) => 
        new Date(order.createTime) > new Date(latest.createTime) ? order : latest
      )
    : undefined;

  let valueTier: ValueTier = 'low';
  if (weightedValue >= VALUE_TIER_THRESHOLDS.ultra_high) {
    valueTier = 'ultra_high';
  } else if (weightedValue >= VALUE_TIER_THRESHOLDS.high) {
    valueTier = 'high';
  } else if (weightedValue >= VALUE_TIER_THRESHOLDS.medium) {
    valueTier = 'medium';
  }

  return {
    totalOrderAmount,
    orderCount,
    completedAmount,
    avgOrderAmount,
    levelMultiplier,
    weightedValue,
    valueTier,
    lastOrderTime: lastOrder?.createTime
  };
};

export const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export const getValueTierInfo = (valueTier: ValueTier): { label: string; color: string } => {
  return VALUE_TIER_LABELS[valueTier];
};
