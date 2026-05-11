import Mock from 'mockjs';
import type { Customer, Order, PerformanceTarget, OperationLog, CustomerCategory, CustomerLevel, CustomerStatus, OrderStatus, OperationType } from '@/types';

const Random = Mock.Random;

const customerCategories: CustomerCategory[] = ['enterprise', 'individual', 'partner', 'potential'];
const customerLevels: CustomerLevel[] = ['A', 'B', 'C', 'D'];
const customerStatuses: CustomerStatus[] = ['not_cooperated', 'cooperating', 'lost'];
const orderStatuses: OrderStatus[] = ['pending_payment', 'shipped', 'completed', 'refunded'];
const operationTypes: OperationType[] = [
  'create_customer', 'update_customer', 'delete_customer', 'update_customer_level',
  'create_order', 'update_order', 'adjust_order_amount', 'add_follow_up_note'
];

const generateCustomers = (count: number): Customer[] => {
  const customers: Customer[] = [];
  for (let i = 0; i < count; i++) {
    const createTime = Random.datetime('yyyy-MM-dd HH:mm:ss', '2024-01-01', '2025-05-10');
    const updateTime = Random.datetime('yyyy-MM-dd HH:mm:ss', createTime, '2025-05-10');
    customers.push({
      id: Random.guid(),
      category: Random.pick(customerCategories),
      companyName: Random.ctitle(5, 10),
      contact: Random.cname(),
      phone: /^1[3-9]\d{9}$/.toString(),
      level: Random.pick(customerLevels),
      status: Random.pick(customerStatuses),
      createTime,
      updateTime,
      followUpNotes: Random.boolean() ? Random.cparagraph(1, 2) : undefined
    });
  }
  return customers;
};

const generateOrders = (customers: Customer[], count: number): Order[] => {
  const orders: Order[] = [];
  if (customers.length === 0) return orders;
  
  for (let i = 0; i < count; i++) {
    const customer = Random.pick(customers);
    const amount = Random.integer(1000, 500000);
    const status = Random.pick(orderStatuses);
    const createTime = Random.datetime('yyyy-MM-dd HH:mm:ss', '2024-01-01', '2025-05-10');
    const updateTime = Random.datetime('yyyy-MM-dd HH:mm:ss', createTime, '2025-05-10');
    orders.push({
      id: Random.guid(),
      customerId: customer.id,
      customerName: customer.companyName,
      orderNo: `ORD${Random.date('yyyyMMdd')}${Random.string('number', 6)}`,
      amount,
      status,
      createTime,
      updateTime,
      isLargeAmount: amount > 100000,
      processed: status !== 'pending_payment' || amount <= 100000
    });
  }
  return orders;
};

const generatePerformanceTargets = (): PerformanceTarget[] => {
  const targets: PerformanceTarget[] = [];
  for (let i = 1; i <= 5; i++) {
    const target = Random.integer(500000, 2000000);
    const actual = Random.integer(Math.floor(target * 0.5), Math.floor(target * 1.2));
    targets.push({
      month: `2025-0${i}`,
      target,
      actual,
      completionRate: Number(((actual / target) * 100).toFixed(2))
    });
  }
  return targets;
};

const generateLogs = (count: number): OperationLog[] => {
  const logs: OperationLog[] = [];
  const descriptions: Record<OperationType, string[]> = {
    create_customer: ['新建客户档案', '新增客户记录', '创建新客户信息'],
    update_customer: ['更新客户基础信息', '修改客户联系方式', '编辑客户资料'],
    delete_customer: ['删除客户档案'],
    update_customer_level: ['调整客户等级', '升级客户级别', '客户等级调整'],
    create_order: ['创建销售订单', '新增订单记录', '客户下单'],
    update_order: ['更新订单状态', '修改订单信息'],
    adjust_order_amount: ['调整订单金额', '手动修改订单价格'],
    add_follow_up_note: ['添加客户跟进备注', '记录客户沟通内容', '新增跟进记录'],
    delete_order: ['取消订单'],
    update_performance_target: ['更新业绩目标']
  };
  
  for (let i = 0; i < count; i++) {
    const type = Random.pick(operationTypes);
    const targetType = type.includes('customer') ? 'customer' : type.includes('order') ? 'order' : 'performance';
    const createTime = Random.datetime('yyyy-MM-dd HH:mm:ss', '2024-01-01', '2025-05-10');
    
    logs.push({
      id: Random.guid(),
      type,
      description: Random.pick(descriptions[type]),
      operator: Random.cname(),
      operatorId: Random.string('number', 6),
      targetId: Random.guid(),
      targetType,
      createTime
    });
  }
  return logs.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
};

const customers = generateCustomers(50);
const orders = generateOrders(customers, 80);
const performanceTargets = generatePerformanceTargets();
const logs = generateLogs(100);

export { customers, orders, performanceTargets, logs };
export { customerCategories, customerLevels, customerStatuses, orderStatuses, operationTypes };
