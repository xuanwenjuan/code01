import React, { useState, useMemo, useCallback } from 'react';
import type { TableColumnsType, MenuProps, StepsProps } from 'antd';
import { Card, Table, Button, Space, Tag, message, Input, Select, Statistic, Row, Col, Progress, Badge, Alert, Form, InputNumber, Steps, Tooltip, Dropdown } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, FilterOutlined, ShoppingCartOutlined, DollarOutlined, WarningOutlined, CheckCircleOutlined, ReloadOutlined, MoreOutlined, ExperimentOutlined } from '@ant-design/icons';
import OrderModal from '@/components/OrderModal';
import CommonModal from '@/components/CommonModal';
import { useAppStore, useFilteredOrders } from '@/store';
import { OrderStatusOptions, LARGE_ORDER_THRESHOLD, OrderStatusMap, ORDER_STATUS_FLOW } from '@/constants';
import type { Order, OrderStatus, PerformanceTarget, AmountFormValues } from '@/types';

interface OrderStats {
  total: number;
  totalAmount: number;
  pendingCount: number;
  largeAmountCount: number;
  completedAmount: number;
}

interface StatusFlowItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const OrderManagement: React.FC = () => {
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [amountModalOpen, setAmountModalOpen] = useState<boolean>(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [amountForm] = Form.useForm<AmountFormValues>();

  const {
    orders,
    performanceTargets,
    updateOrderStatus,
    adjustOrderAmount,
    processLargeOrder,
    updatePerformanceTarget,
    setOrderFilter,
    orderFilter
  } = useAppStore();
  const filteredOrders: Order[] = useFilteredOrders();

  const stats: OrderStats = useMemo(() => {
    const total: number = orders.length;
    const totalAmount: number = orders.reduce((sum: number, o: Order) => sum + o.amount, 0);
    const pendingCount: number = orders.filter((o: Order) => o.status === 'pending_payment').length;
    const largeAmountCount: number = orders.filter((o: Order) => o.isLargeAmount && !o.processed).length;
    const completedAmount: number = orders
      .filter((o: Order) => o.status === 'completed')
      .reduce((sum: number, o: Order) => sum + o.amount, 0);
    return { total, totalAmount, pendingCount, largeAmountCount, completedAmount };
  }, [orders]);

  const getStatusOption = (status: OrderStatus) => {
    return OrderStatusOptions.find((o) => o.value === status);
  };

  const getAvailableTransitions = (currentStatus: OrderStatus): OrderStatus[] => {
    return ORDER_STATUS_FLOW[currentStatus] || [];
  };

  const handleEdit = useCallback((order: Order): void => {
    setCurrentOrder(order);
    setOrderModalOpen(true);
  }, []);

  const handleStatusChange = useCallback((orderId: string, newStatus: OrderStatus): void => {
    const success: boolean = updateOrderStatus(orderId, newStatus);
    if (success) {
      message.success(`订单状态已更新为: ${OrderStatusMap[newStatus]}`);
    } else {
      message.error('订单状态转换无效，请检查订单当前状态');
    }
  }, [updateOrderStatus]);

  const handleAdjustAmount = useCallback((order: Order): void => {
    setCurrentOrder(order);
    amountForm.setFieldsValue({ amount: order.amount });
    setAmountModalOpen(true);
  }, [amountForm]);

  const submitAmount = async (): Promise<void> => {
    const values: AmountFormValues = await amountForm.validateFields();
    if (currentOrder) {
      adjustOrderAmount(currentOrder.id, values.amount);
      message.success('订单金额已更新');
      setAmountModalOpen(false);
    }
  };

  const handleProcessLargeOrder = useCallback((orderId: string): void => {
    processLargeOrder(orderId);
    message.success('大额订单已标记为已处理');
  }, [processLargeOrder]);

  const handleUpdatePerformance = useCallback((month: string, field: keyof PerformanceTarget, value: number): void => {
    updatePerformanceTarget(month, { [field]: value });
    message.success('业绩目标已更新');
  }, [updatePerformanceTarget]);

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const transitions: OrderStatus[] = getAvailableTransitions(currentStatus);
    const normalTransitions: OrderStatus[] = transitions.filter((s: OrderStatus) => s !== 'refunded');
    return normalTransitions.length > 0 ? normalTransitions[0] : null;
  };

  const columns: TableColumnsType<Order> = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      fixed: 'left' as const,
      width: 180,
      render: (text: string) => (
        <Space>
          <ShoppingCartOutlined />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      )
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 160
    },
    {
      title: '订单金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      sorter: (a: Order, b: Order) => a.amount - b.amount,
      render: (amount: number, record: Order) => (
        <Space>
          <span style={{ fontWeight: 500, color: amount > LARGE_ORDER_THRESHOLD ? '#ff4d4f' : '#52c41a' }}>
            ¥{amount.toLocaleString()}
          </span>
          {record.isLargeAmount && !record.processed && (
            <Tooltip title="大额订单，待处理">
              <Badge status="warning" />
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: OrderStatusOptions.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value: string | number | boolean, record: Order) => record.status === value,
      render: (status: OrderStatus) => {
        const option = getStatusOption(status);
        return <Tag color={option?.color}>{option?.label}</Tag>;
      }
    },
    {
      title: '大额预警',
      key: 'warning',
      width: 100,
      render: (_: unknown, record: Order) => {
        if (record.isLargeAmount) {
          return record.processed ? (
            <Tag icon={<CheckCircleOutlined />} color="success">已处理</Tag>
          ) : (
            <Tooltip title="点击标记为已处理">
              <Tag 
                icon={<WarningOutlined />} 
                color="error"
                style={{ cursor: 'pointer' }}
                onClick={() => handleProcessLargeOrder(record.id)}
              >
                待处理
              </Tag>
            </Tooltip>
          );
        }
        return <span style={{ color: '#999' }}>-</span>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      sorter: (a: Order, b: Order) => 
        new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 160
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: Order) => {
        const nextStatus: OrderStatus | null = getNextStatus(record.status);
        const menuItems: MenuProps['items'] = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑订单',
            onClick: () => handleEdit(record)
          },
          {
            key: 'amount',
            icon: <DollarOutlined />,
            label: '调整金额',
            onClick: () => handleAdjustAmount(record)
          }
        ];

        if (nextStatus) {
          const nextOption = getStatusOption(nextStatus);
          menuItems.splice(1, 0, {
            key: 'status',
            icon: <ReloadOutlined />,
            label: `流转到: ${nextOption?.label}`,
            onClick: () => handleStatusChange(record.id, nextStatus)
          });
        }

        if (record.status !== 'completed' && record.status !== 'refunded') {
          menuItems.push({
            key: 'refund',
            icon: <ExperimentOutlined />,
            label: '申请退款',
            onClick: () => handleStatusChange(record.id, 'refunded')
          });
        }

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      }
    }
  ];

  const getOrderStatusCount = (status: OrderStatus): number => {
    return orders.filter((o: Order) => o.status === status).length;
  };

  const statusStepItems: StepsProps['items'] = [
    { title: OrderStatusMap.pending_payment, status: 'process', description: `${getOrderStatusCount('pending_payment')} 笔` },
    { title: OrderStatusMap.shipped, status: 'process', description: `${getOrderStatusCount('shipped')} 笔` },
    { title: OrderStatusMap.completed, status: 'finish', description: `${getOrderStatusCount('completed')} 笔` },
    { title: OrderStatusMap.refunded, status: 'error', description: `${getOrderStatusCount('refunded')} 笔` }
  ];

  const handleOrderFilterKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setOrderFilter({ ...orderFilter, keyword: e.target.value });
  };

  const handleOrderFilterStatusChange = (value: OrderStatus | undefined): void => {
    setOrderFilter({ ...orderFilter, status: value });
  };

  const handleOrderFilterMinAmountChange = (value: number | null): void => {
    setOrderFilter({ ...orderFilter, minAmount: value ?? undefined });
  };

  const handleOrderFilterMaxAmountChange = (value: number | null): void => {
    setOrderFilter({ ...orderFilter, maxAmount: value ?? undefined });
  };

  const handleResetOrderFilter = (): void => {
    setOrderFilter({});
  };

  const handleOpenNewOrderModal = (): void => {
    setCurrentOrder(null);
    setOrderModalOpen(true);
  };

  const handleCloseOrderModal = (): void => {
    setOrderModalOpen(false);
    setCurrentOrder(null);
  };

  const handleCloseAmountModal = (): void => {
    setAmountModalOpen(false);
  };

  return (
    <div style={{ padding: '24px' }}>
      {stats.largeAmountCount > 0 && (
        <Alert
          message={`预警提醒：有 ${stats.largeAmountCount} 笔大额订单待处理（金额 > ¥${LARGE_ORDER_THRESHOLD.toLocaleString()}）`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: '16px' }}
          closable
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={stats.total}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="订单总金额"
              value={stats.totalAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待付款订单"
              value={stats.pendingCount}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已完成金额"
              value={stats.completedAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="月度业绩目标" 
        style={{ marginBottom: '16px' }}
        extra={
          <Tooltip title="点击数字可编辑目标金额和实际金额">
            <span style={{ color: '#999', fontSize: '12px' }}>提示：点击数字可编辑</span>
          </Tooltip>
        }
      >
        <Row gutter={[16, 16]}>
          {performanceTargets.map((target: PerformanceTarget) => (
            <Col xs={24} sm={12} md={6} key={target.month}>
              <Card size="small" title={`${target.month}月`}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#999' }}>目标：</span>
                    <Tooltip title="点击编辑目标金额">
                      <InputNumber
                        size="small"
                        value={target.target}
                        onChange={(value: number | null) => handleUpdatePerformance(target.month, 'target', value ?? 0)}
                        style={{ width: 120 }}
                        min={0}
                        formatter={(value: number | undefined) => `¥${value ?? 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value: string | undefined) => Number(value?.replace(/\¥|(,*)/g, '')) || 0}
                      />
                    </Tooltip>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#999' }}>实际：</span>
                    <Tooltip title="点击编辑实际金额">
                      <InputNumber
                        size="small"
                        value={target.actual}
                        onChange={(value: number | null) => handleUpdatePerformance(target.month, 'actual', value ?? 0)}
                        style={{ width: 120 }}
                        min={0}
                        formatter={(value: number | undefined) => `¥${value ?? 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value: string | undefined) => Number(value?.replace(/\¥|(,*)/g, '')) || 0}
                      />
                    </Tooltip>
                  </div>
                  <Progress
                    percent={target.completionRate}
                    status={target.completionRate >= 100 ? 'success' : target.completionRate >= 80 ? 'active' : 'exception'}
                    format={(percent: number | undefined) => `${percent ?? 0}%`}
                  />
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <FilterOutlined />
            <span>订单筛选</span>
          </Space>
        }
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="搜索订单号、客户名称"
              prefix={<SearchOutlined />}
              value={orderFilter.keyword}
              onChange={handleOrderFilterKeywordChange}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select<OrderStatus>
              placeholder="订单状态"
              allowClear
              style={{ width: '100%' }}
              value={orderFilter.status}
              onChange={handleOrderFilterStatusChange}
            >
              {OrderStatusOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <InputNumber
              placeholder="最小金额"
              style={{ width: '100%' }}
              value={orderFilter.minAmount}
              onChange={handleOrderFilterMinAmountChange}
              min={0}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <InputNumber
              placeholder="最大金额"
              style={{ width: '100%' }}
              value={orderFilter.maxAmount}
              onChange={handleOrderFilterMaxAmountChange}
              min={0}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Button
              onClick={handleResetOrderFilter}
              style={{ width: '100%' }}
            >
              重置筛选
            </Button>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenNewOrderModal}
              style={{ width: '100%' }}
            >
              新建订单
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        title="订单流转状态"
        style={{ marginBottom: '16px' }}
      >
        <Steps
          current={-1}
          items={statusStepItems}
        />
      </Card>

      <Card>
        <Table<Order>
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          scroll={{ x: 1200 }}
          rowClassName={(record: Order) => 
            record.isLargeAmount && !record.processed ? 'table-row-warning' : ''
          }
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <OrderModal
        open={orderModalOpen}
        onClose={handleCloseOrderModal}
        order={currentOrder}
      />

      <CommonModal
        title="调整订单金额"
        open={amountModalOpen}
        onClose={handleCloseAmountModal}
        onConfirm={submitAmount}
        width={400}
      >
        <Form form={amountForm} layout="vertical">
          <Form.Item<AmountFormValues>
            name="amount"
            label="订单金额（元）"
            rules={[
              { required: true, message: '请输入订单金额' },
              { type: 'number', min: 0, message: '金额必须大于等于0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入订单金额"
              min={0}
              step={100}
              formatter={(value: number | undefined) => `¥ ${value ?? 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: string | undefined) => Number(value?.replace(/\¥\s?|(,*)/g, '')) || 0}
            />
          </Form.Item>
        </Form>
      </CommonModal>

      <style>{`
        .table-row-warning {
          background-color: #fff7e6 !important;
        }
        .table-row-warning:hover > td {
          background-color: #fff1d9 !important;
        }
      `}</style>
    </div>
  );
};

export default OrderManagement;
