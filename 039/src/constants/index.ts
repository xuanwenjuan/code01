import type { CustomerCategory, CustomerLevel, CustomerStatus, OrderStatus, OperationType, ValueTier, SelectOption, OrderStatusFlow } from '@/types';

export const ORDER_STATUS_FLOW: OrderStatusFlow = {
  pending_payment: ['shipped', 'refunded'],
  shipped: ['completed', 'refunded'],
  completed: [],
  refunded: []
};

export const CustomerCategoryOptions: SelectOption<CustomerCategory>[] = [
  { value: 'enterprise', label: '企业客户' },
  { value: 'individual', label: '个人客户' },
  { value: 'partner', label: '渠道合作伙伴' },
  { value: 'potential', label: '潜在客户' }
];

export const CustomerLevelOptions: SelectOption<CustomerLevel>[] = [
  { value: 'A', label: 'A级客户' },
  { value: 'B', label: 'B级客户' },
  { value: 'C', label: 'C级客户' },
  { value: 'D', label: 'D级客户' }
];

export const CustomerStatusOptions: SelectOption<CustomerStatus>[] = [
  { value: 'not_cooperated', label: '未合作', color: 'default' },
  { value: 'cooperating', label: '合作中', color: 'success' },
  { value: 'lost', label: '已流失', color: 'error' }
];

export const OrderStatusOptions: SelectOption<OrderStatus>[] = [
  { value: 'pending_payment', label: '待付款', color: 'warning' },
  { value: 'shipped', label: '已发货', color: 'processing' },
  { value: 'completed', label: '已完成', color: 'success' },
  { value: 'refunded', label: '已退款', color: 'error' }
];

export const OperationTypeOptions: SelectOption<OperationType>[] = [
  { value: 'create_customer', label: '创建客户' },
  { value: 'update_customer', label: '更新客户' },
  { value: 'delete_customer', label: '删除客户' },
  { value: 'update_customer_level', label: '调整客户等级' },
  { value: 'create_order', label: '创建订单' },
  { value: 'update_order', label: '更新订单' },
  { value: 'delete_order', label: '删除订单' },
  { value: 'adjust_order_amount', label: '调整订单金额' },
  { value: 'add_follow_up_note', label: '添加跟进备注' },
  { value: 'update_performance_target', label: '更新业绩目标' },
  { value: 'process_large_order', label: '处理大额订单' }
];

export const TargetTypeOptions: SelectOption<'customer' | 'order' | 'performance'>[] = [
  { value: 'customer', label: '客户' },
  { value: 'order', label: '订单' },
  { value: 'performance', label: '业绩' }
];

export const ValueTierOptions: SelectOption<ValueTier>[] = [
  { value: 'ultra_high', label: '超高价值' },
  { value: 'high', label: '高价值' },
  { value: 'medium', label: '中价值' },
  { value: 'low', label: '低价值' }
];

export const LARGE_ORDER_THRESHOLD = 100000;

export const OrderStatusMap: Record<OrderStatus, string> = {
  pending_payment: '待付款',
  shipped: '已发货',
  completed: '已完成',
  refunded: '已退款'
};

export const CustomerStatusMap: Record<CustomerStatus, string> = {
  not_cooperated: '未合作',
  cooperating: '合作中',
  lost: '已流失'
};

export const CustomerLevelMap: Record<CustomerLevel, string> = {
  A: 'A级客户',
  B: 'B级客户',
  C: 'C级客户',
  D: 'D级客户'
};

export const CustomerCategoryMap: Record<CustomerCategory, string> = {
  enterprise: '企业客户',
  individual: '个人客户',
  partner: '渠道合作伙伴',
  potential: '潜在客户'
};

export const ValueTierMap: Record<ValueTier, { label: string; color: string }> = {
  ultra_high: { label: '超高价值', color: '#ff4d4f' },
  high: { label: '高价值', color: '#faad14' },
  medium: { label: '中价值', color: '#1890ff' },
  low: { label: '低价值', color: '#999999' }
};
