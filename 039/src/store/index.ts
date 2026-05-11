import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useMemo } from 'react';
import { customers as mockCustomers, orders as mockOrders, performanceTargets as mockTargets, logs as mockLogs } from '@/mock';
import { calculateCustomerValue } from '@/utils/valueCalculator';
import { ORDER_STATUS_FLOW, LARGE_ORDER_THRESHOLD, OrderStatusMap } from '@/constants';
import type { 
  Customer, 
  Order, 
  PerformanceTarget, 
  OperationLog, 
  CustomerFilter, 
  OrderFilter, 
  LogFilter, 
  CustomerCategory, 
  CustomerLevel, 
  CustomerStatus, 
  OrderStatus, 
  OperationType,
  CustomerWithValue,
  CustomerValue,
  ValueStats
} from '@/types';

const generateId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const getNowStr = (): string => new Date().toISOString().slice(0, 19).replace('T', ' ');

const isValidStatusTransition = (from: OrderStatus, to: OrderStatus): boolean => {
  return ORDER_STATUS_FLOW[from].includes(to);
};

interface AppState {
  customers: Customer[];
  orders: Order[];
  performanceTargets: PerformanceTarget[];
  logs: OperationLog[];
  
  customerFilter: CustomerFilter;
  orderFilter: OrderFilter;
  logFilter: LogFilter;
  
  setCustomerFilter: (filter: CustomerFilter) => void;
  setOrderFilter: (filter: OrderFilter) => void;
  setLogFilter: (filter: LogFilter) => void;
  
  addCustomer: (customer: Omit<Customer, 'id' | 'createTime' | 'updateTime'>) => void;
  updateCustomer: (id: string, data: Partial<Omit<Customer, 'id' | 'createTime' | 'updateTime'>>) => void;
  deleteCustomer: (id: string) => void;
  updateCustomerLevel: (id: string, level: CustomerLevel) => void;
  addFollowUpNote: (id: string, note: string) => void;
  
  addOrder: (order: Omit<Order, 'id' | 'orderNo' | 'createTime' | 'updateTime' | 'isLargeAmount' | 'processed'>) => void;
  updateOrder: (id: string, data: Partial<Omit<Order, 'id' | 'createTime' | 'updateTime'>>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => boolean;
  adjustOrderAmount: (id: string, amount: number) => void;
  processLargeOrder: (id: string) => void;
  
  updatePerformanceTarget: (month: string, data: Partial<PerformanceTarget>) => void;
  
  addLog: (log: Omit<OperationLog, 'id' | 'createTime' | 'operatorId' | 'operator'>) => void;
}

const initialState: Omit<AppState, keyof Pick<AppState, 
  'setCustomerFilter' | 'setOrderFilter' | 'setLogFilter' | 
  'addCustomer' | 'updateCustomer' | 'deleteCustomer' | 'updateCustomerLevel' | 'addFollowUpNote' |
  'addOrder' | 'updateOrder' | 'updateOrderStatus' | 'adjustOrderAmount' | 'processLargeOrder' |
  'updatePerformanceTarget' | 'addLog'
>> = {
  customers: mockCustomers,
  orders: mockOrders,
  performanceTargets: mockTargets,
  logs: mockLogs,
  customerFilter: {},
  orderFilter: {},
  logFilter: {}
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCustomerFilter: (filter: CustomerFilter) => set({ customerFilter: filter }),
      setOrderFilter: (filter: OrderFilter) => set({ orderFilter: filter }),
      setLogFilter: (filter: LogFilter) => set({ logFilter: filter }),
      
      addCustomer: (customer: Omit<Customer, 'id' | 'createTime' | 'updateTime'>) => {
        const now = getNowStr();
        const newCustomer: Customer = {
          ...customer,
          id: generateId(),
          createTime: now,
          updateTime: now
        };
        const customers: Customer[] = [newCustomer, ...get().customers];
        set({ customers });
        get().addLog({
          type: 'create_customer',
          description: `新建客户: ${customer.companyName}`,
          targetId: newCustomer.id,
          targetType: 'customer'
        });
      },
      
      updateCustomer: (id: string, data: Partial<Omit<Customer, 'id' | 'createTime' | 'updateTime'>>) => {
        const customers: Customer[] = get().customers.map((c: Customer) => 
          c.id === id ? { ...c, ...data, updateTime: getNowStr() } as Customer : c
        );
        set({ customers });
        get().addLog({
          type: 'update_customer',
          description: '更新客户信息',
          targetId: id,
          targetType: 'customer'
        });
      },
      
      deleteCustomer: (id: string) => {
        const customer: Customer | undefined = get().customers.find((c: Customer) => c.id === id);
        const customers: Customer[] = get().customers.filter((c: Customer) => c.id !== id);
        set({ customers });
        if (customer) {
          get().addLog({
            type: 'delete_customer',
            description: `删除客户: ${customer.companyName}`,
            targetId: id,
            targetType: 'customer'
          });
        }
      },
      
      updateCustomerLevel: (id: string, level: CustomerLevel) => {
        const customer: Customer | undefined = get().customers.find((c: Customer) => c.id === id);
        const oldLevel: CustomerLevel | undefined = customer?.level;
        const customers: Customer[] = get().customers.map((c: Customer) => 
          c.id === id ? { ...c, level, updateTime: getNowStr() } as Customer : c
        );
        set({ customers });
        get().addLog({
          type: 'update_customer_level',
          description: `调整客户等级: ${oldLevel} → ${level}`,
          targetId: id,
          targetType: 'customer',
          oldValue: oldLevel,
          newValue: level
        });
      },
      
      addFollowUpNote: (id: string, note: string) => {
        const customer: Customer | undefined = get().customers.find((c: Customer) => c.id === id);
        const newNote: string = customer?.followUpNotes 
          ? `${customer.followUpNotes}\n${getNowStr()}: ${note}`
          : `${getNowStr()}: ${note}`;
        const customers: Customer[] = get().customers.map((c: Customer) => 
          c.id === id ? { ...c, followUpNotes: newNote, updateTime: getNowStr() } as Customer : c
        );
        set({ customers });
        get().addLog({
          type: 'add_follow_up_note',
          description: '添加客户跟进备注',
          targetId: id,
          targetType: 'customer'
        });
      },
      
      addOrder: (order: Omit<Order, 'id' | 'orderNo' | 'createTime' | 'updateTime' | 'isLargeAmount' | 'processed'>) => {
        const now = getNowStr();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const orderNo = `ORD${dateStr}${generateId().substring(0, 6).toUpperCase()}`;
        const newOrder: Order = {
          ...order,
          id: generateId(),
          orderNo,
          createTime: now,
          updateTime: now,
          isLargeAmount: order.amount > LARGE_ORDER_THRESHOLD,
          processed: order.status !== 'pending_payment' || order.amount <= LARGE_ORDER_THRESHOLD
        };
        const orders: Order[] = [newOrder, ...get().orders];
        set({ orders });
        get().addLog({
          type: 'create_order',
          description: `创建订单: ${orderNo}, 金额: ¥${order.amount.toLocaleString()}`,
          targetId: newOrder.id,
          targetType: 'order'
        });
      },
      
      updateOrder: (id: string, data: Partial<Omit<Order, 'id' | 'createTime' | 'updateTime'>>) => {
        const orders: Order[] = get().orders.map((o: Order) => 
          o.id === id ? { ...o, ...data, updateTime: getNowStr() } as Order : o
        );
        set({ orders });
        get().addLog({
          type: 'update_order',
          description: '更新订单信息',
          targetId: id,
          targetType: 'order'
        });
      },
      
      updateOrderStatus: (id: string, status: OrderStatus): boolean => {
        const order: Order | undefined = get().orders.find((o: Order) => o.id === id);
        
        if (!order) {
          return false;
        }
        
        if (order.status === status) {
          return true;
        }
        
        if (!isValidStatusTransition(order.status, status)) {
          get().addLog({
            type: 'update_order',
            description: `尝试无效的状态转换: ${OrderStatusMap[order.status]} → ${OrderStatusMap[status]}`,
            targetId: id,
            targetType: 'order'
          });
          return false;
        }
        
        const orders: Order[] = get().orders.map((o: Order) => 
          o.id === id ? { 
            ...o, 
            status, 
            updateTime: getNowStr(),
            processed: status !== 'pending_payment'
          } as Order : o
        );
        set({ orders });
        get().addLog({
          type: 'update_order',
          description: `更新订单状态: ${OrderStatusMap[order.status]} → ${OrderStatusMap[status]}`,
          targetId: id,
          targetType: 'order',
          oldValue: order.status,
          newValue: status
        });
        return true;
      },
      
      adjustOrderAmount: (id: string, amount: number) => {
        const order: Order | undefined = get().orders.find((o: Order) => o.id === id);
        const oldAmount: number | undefined = order?.amount;
        const orders: Order[] = get().orders.map((o: Order) => 
          o.id === id ? { 
            ...o, 
            amount, 
            updateTime: getNowStr(),
            isLargeAmount: amount > LARGE_ORDER_THRESHOLD,
            processed: order?.status !== 'pending_payment' || amount <= LARGE_ORDER_THRESHOLD
          } as Order : o
        );
        set({ orders });
        get().addLog({
          type: 'adjust_order_amount',
          description: `调整订单金额: ¥${oldAmount?.toLocaleString() || 0} → ¥${amount.toLocaleString()}`,
          targetId: id,
          targetType: 'order',
          oldValue: oldAmount?.toString(),
          newValue: amount.toString()
        });
      },
      
      processLargeOrder: (id: string) => {
        const order: Order | undefined = get().orders.find((o: Order) => o.id === id);
        const orders: Order[] = get().orders.map((o: Order) => 
          o.id === id ? { ...o, processed: true, updateTime: getNowStr() } as Order : o
        );
        set({ orders });
        get().addLog({
          type: 'process_large_order',
          description: `处理大额订单: ${order?.orderNo}`,
          targetId: id,
          targetType: 'order'
        });
      },
      
      updatePerformanceTarget: (month: string, data: Partial<PerformanceTarget>) => {
        const targets: PerformanceTarget[] = get().performanceTargets.map((t: PerformanceTarget) => 
          t.month === month ? { 
            ...t, 
            ...data,
            completionRate: data.target 
              ? Number(((data.actual ?? t.actual) / data.target * 100).toFixed(2))
              : data.actual !== undefined
                ? Number((data.actual / t.target * 100).toFixed(2))
                : t.completionRate
          } as PerformanceTarget : t
        );
        set({ performanceTargets: targets });
        get().addLog({
          type: 'update_performance_target',
          description: `更新${month}月业绩目标`,
          targetId: month,
          targetType: 'performance'
        });
      },
      
      addLog: (log: Omit<OperationLog, 'id' | 'createTime' | 'operatorId' | 'operator'>) => {
        const newLog: OperationLog = {
          ...log,
          id: generateId(),
          createTime: getNowStr(),
          operator: '当前用户',
          operatorId: 'USER001'
        };
        const logs: OperationLog[] = [newLog, ...get().logs];
        set({ logs });
      }
    }),
    {
      name: 'enterprise-customer-order-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state: AppState) => ({
        customers: state.customers,
        orders: state.orders,
        performanceTargets: state.performanceTargets,
        logs: state.logs
      })
    }
  )
);

export const useCustomerValue = (customerId: string): CustomerValue | null => {
  const { customers, orders } = useAppStore();
  const customer = customers.find((c: Customer) => c.id === customerId);
  
  if (!customer) return null;
  
  return useMemo(() => {
    return calculateCustomerValue(customer, orders);
  }, [customer, orders]);
};

export const useAllCustomersWithValue = (): CustomerWithValue[] => {
  const { customers, orders } = useAppStore();
  
  return useMemo(() => {
    return customers.map((customer: Customer) => ({
      ...customer,
      valueInfo: calculateCustomerValue(customer, orders)
    }));
  }, [customers, orders]);
};

export const useFilteredCustomers = (): CustomerWithValue[] => {
  const { customerFilter } = useAppStore();
  const customersWithValue = useAllCustomersWithValue();
  
  return useMemo(() => {
    return customersWithValue.filter((c: CustomerWithValue) => {
      if (customerFilter.category && c.category !== customerFilter.category) return false;
      if (customerFilter.level && c.level !== customerFilter.level) return false;
      if (customerFilter.status && c.status !== customerFilter.status) return false;
      if (customerFilter.valueTier && c.valueInfo.valueTier !== customerFilter.valueTier) return false;
      if (customerFilter.minValue !== undefined && c.valueInfo.weightedValue < customerFilter.minValue) return false;
      if (customerFilter.maxValue !== undefined && c.valueInfo.weightedValue > customerFilter.maxValue) return false;
      if (customerFilter.keyword) {
        const keyword: string = customerFilter.keyword.toLowerCase();
        if (!c.companyName.toLowerCase().includes(keyword) &&
            !c.contact.toLowerCase().includes(keyword) &&
            !c.phone.includes(keyword)) {
          return false;
        }
      }
      return true;
    });
  }, [customersWithValue, customerFilter]);
};

export const useFilteredOrders = (): Order[] => {
  const { orders, orderFilter, customers } = useAppStore();
  
  return useMemo(() => {
    return orders.filter((o: Order) => {
      if (orderFilter.status && o.status !== orderFilter.status) return false;
      if (orderFilter.customerId && o.customerId !== orderFilter.customerId) return false;
      if (orderFilter.minAmount !== undefined && o.amount < orderFilter.minAmount) return false;
      if (orderFilter.maxAmount !== undefined && o.amount > orderFilter.maxAmount) return false;
      if (orderFilter.keyword) {
        const keyword: string = orderFilter.keyword.toLowerCase();
        const customer: Customer | undefined = customers.find((c: Customer) => c.id === o.customerId);
        if (!o.orderNo.toLowerCase().includes(keyword) &&
            !o.customerName.toLowerCase().includes(keyword) &&
            customer && !customer.companyName.toLowerCase().includes(keyword)) {
          return false;
        }
      }
      return true;
    });
  }, [orders, orderFilter, customers]);
};

export const useFilteredLogs = (): OperationLog[] => {
  const { logs, logFilter } = useAppStore();
  
  return useMemo(() => {
    return logs.filter((l: OperationLog) => {
      if (logFilter.type && l.type !== logFilter.type) return false;
      if (logFilter.targetType && l.targetType !== logFilter.targetType) return false;
      if (logFilter.startTime && new Date(l.createTime) < new Date(logFilter.startTime)) return false;
      if (logFilter.endTime) {
        const endTime: Date = new Date(logFilter.endTime);
        endTime.setHours(23, 59, 59, 999);
        if (new Date(l.createTime) > endTime) return false;
      }
      if (logFilter.keyword) {
        const keyword: string = logFilter.keyword.toLowerCase();
        if (!l.description.toLowerCase().includes(keyword) &&
            !l.operator.toLowerCase().includes(keyword)) {
          return false;
        }
      }
      return true;
    });
  }, [logs, logFilter]);
};

export const useValueStats = (): ValueStats => {
  const customersWithValue = useAllCustomersWithValue();
  
  return useMemo((): ValueStats => {
    const totalValue: number = customersWithValue.reduce((sum: number, c: CustomerWithValue) => sum + c.valueInfo.weightedValue, 0);
    const avgValue: number = customersWithValue.length > 0 ? totalValue / customersWithValue.length : 0;
    const highValueCount: number = customersWithValue.filter(
      (c: CustomerWithValue) => c.valueInfo.valueTier === 'high' || c.valueInfo.valueTier === 'ultra_high'
    ).length;
    const ultraHighCount: number = customersWithValue.filter(
      (c: CustomerWithValue) => c.valueInfo.valueTier === 'ultra_high'
    ).length;
    
    return {
      totalValue,
      avgValue,
      highValueCount,
      ultraHighCount,
      totalCustomers: customersWithValue.length
    };
  }, [customersWithValue]);
};
