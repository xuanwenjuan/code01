import { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Form, message, Statistic, Row, Col, DatePicker } from 'antd';
import { PlusOutlined, SearchOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAppStore } from '@/store';
import ModalForm from '@/components/ModalForm';
import type { Order } from '@/types';
import dayjs from 'dayjs';
import mockApi from '@/mock';
import './index.scss';

interface OrderFormData {
  customerId: string;
  packageId: string;
  status: 'pending' | 'verified' | 'expired';
}

interface FilterState {
  searchText: string;
  status: string;
  packageId: string;
  customerId: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
  minAmount: number | null;
  maxAmount: number | null;
}

const statusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'warning', text: '待核销' },
  verified: { color: 'success', text: '已核销' },
  expired: { color: 'error', text: '已过期' }
};

const { RangePicker } = DatePicker;

const OrdersPage = () => {
  const { orders, customers, packages, setOrders, setCustomers, setPackages, addOrder, updateOrder } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    status: '',
    packageId: '',
    customerId: '',
    dateRange: null,
    minAmount: null,
    maxAmount: null
  });

  const availablePackages = useMemo(() => {
    const usedPackageIds = new Set(orders.map(o => o.packageId));
    return packages.filter(p => usedPackageIds.has(p.id));
  }, [orders, packages]);

  const availableCustomers = useMemo(() => {
    const usedCustomerIds = new Set(orders.map(o => o.customerId));
    return customers.filter(c => usedCustomerIds.has(c.id));
  }, [orders, customers]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchSearch =
          order.customerName.toLowerCase().includes(searchLower) ||
          order.packageName.toLowerCase().includes(searchLower) ||
          order.orderNo.toLowerCase().includes(searchLower);
        if (!matchSearch) return false;
      }

      if (filters.status && order.status !== filters.status) {
        return false;
      }

      if (filters.packageId && order.packageId !== filters.packageId) {
        return false;
      }

      if (filters.customerId && order.customerId !== filters.customerId) {
        return false;
      }

      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const purchaseDate = dayjs(order.purchaseDate);
        const startDate = filters.dateRange[0].startOf('day');
        const endDate = filters.dateRange[1].endOf('day');
        if (!purchaseDate.isBetween(startDate, endDate, null, '[]')) {
          return false;
        }
      }

      if (filters.minAmount !== null && order.totalAmount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount !== null && order.totalAmount > filters.maxAmount) {
        return false;
      }

      return true;
    });
  }, [orders, filters]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const custRes = mockApi.getCustomers();
        const pkgRes = mockApi.getPackages();
        const ordRes = mockApi.getOrders();
        setCustomers(custRes.data);
        setPackages(pkgRes.data);
        setOrders(ordRes.data);
      } catch (error) {
        message.error('数据加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setCustomers, setPackages, setOrders]);

  const stats = useMemo(() => ({
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    verified: filteredOrders.filter(o => o.status === 'verified').length,
    totalAmount: filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  }), [filteredOrders]);

  const handleAdd = () => {
    setModalVisible(true);
  };

  const handleResetFilters = () => {
    setFilters({
      searchText: '',
      status: '',
      packageId: '',
      customerId: '',
      dateRange: null,
      minAmount: null,
      maxAmount: null
    });
  };

  const handleVerify = (record: Order) => {
    updateOrder(record.id, { status: 'verified', verifiedDate: new Date().toISOString().split('T')[0] });
    message.success('订单核销成功');
  };

  const handleSubmit = (values: OrderFormData) => {
    const customer = customers.find(c => c.id === values.customerId);
    const pkg = packages.find(p => p.id === values.packageId);

    const newOrder: Order = {
      ...values,
      id: Date.now().toString(),
      orderNo: `ORD${Date.now().toString().padStart(10, '0')}`,
      customerName: customer?.name || '',
      packageName: pkg?.name || '',
      totalAmount: pkg?.discountPrice || 0,
      purchaseDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + (pkg?.validityDays || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    addOrder(newOrder);
    message.success('订单创建成功');
    setModalVisible(false);
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 150,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: '客户姓名',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120
    },
    {
      title: '套餐名称',
      dataIndex: 'packageName',
      key: 'packageName',
      width: 150
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (amount: number) => <span className="price">¥{amount?.toLocaleString() || 0}</span>
    },
    {
      title: '购买日期',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 120,
      render: (date: string) => date?.split('T')[0] || '-'
    },
    {
      title: '有效期至',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: Order) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleVerify(record)}
            >
              核销
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="orders-page">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats.total}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="待核销"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="已核销"
              value={stats.verified}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="总金额"
              value={stats.totalAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="page-card">
        <div className="page-header">
          <h2 className="page-title">消费套餐订单管理</h2>
          <Space wrap size="middle">
            <Input
              placeholder="搜索订单/客户/套餐"
              prefix={<SearchOutlined />}
              value={filters.searchText}
              onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
              style={{ width: 220 }}
            />
            <Select
              placeholder="状态筛选"
              value={filters.status || undefined}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
              allowClear
              style={{ width: 130 }}
            >
              <Select.Option value="pending">待核销</Select.Option>
              <Select.Option value="verified">已核销</Select.Option>
              <Select.Option value="expired">已过期</Select.Option>
            </Select>
            <Select
              placeholder="选择套餐"
              value={filters.packageId || undefined}
              onChange={(value) => setFilters(prev => ({ ...prev, packageId: value || '' }))}
              allowClear
              style={{ width: 160 }}
              showSearch
              filterOption={(input, option) => {
                const pkg = availablePackages.find(p => p.id === option?.value);
                return pkg?.name.toLowerCase().includes(input.toLowerCase()) || false;
              }}
            >
              {availablePackages.map((pkg) => (
                <Select.Option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="选择客户"
              value={filters.customerId || undefined}
              onChange={(value) => setFilters(prev => ({ ...prev, customerId: value || '' }))}
              allowClear
              style={{ width: 140 }}
              showSearch
              filterOption={(input, option) => {
                const cust = availableCustomers.find(c => c.id === option?.value);
                return cust?.name.includes(input) || false;
              }}
            >
              {availableCustomers.map((cust) => (
                <Select.Option key={cust.id} value={cust.id}>
                  {cust.name}
                </Select.Option>
              ))}
            </Select>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] | null }))}
              style={{ width: 260 }}
            />
            <Input.Group compact style={{ width: 180 }}>
              <Input
                style={{ width: '50%' }}
                placeholder="最低金额"
                type="number"
                value={filters.minAmount?.toString() || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  minAmount: e.target.value ? Number(e.target.value) : null
                }))}
              />
              <Input
                style={{ width: '50%' }}
                placeholder="最高金额"
                type="number"
                value={filters.maxAmount?.toString() || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  maxAmount: e.target.value ? Number(e.target.value) : null
                }))}
              />
            </Input.Group>
            <Button onClick={handleResetFilters}>重置筛选</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增订单
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>

      <ModalForm<OrderFormData>
        title="新增订单"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={{ status: 'pending' }}
        width={500}
      >
        <Form.Item
          name="customerId"
          label="选择客户"
          rules={[{ required: true, message: '请选择客户' }]}
        >
          <Select placeholder="请选择客户" showSearch filterOption={(input, option) => {
            const customer = customers.find(c => c.id === option?.value);
            return customer?.name.includes(input) || false;
          }}>
            {customers.map((cust) => (
              <Select.Option key={cust.id} value={cust.id}>
                {cust.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="packageId"
          label="选择套餐"
          rules={[{ required: true, message: '请选择套餐' }]}
        >
          <Select placeholder="请选择套餐">
            {packages.map((pkg) => (
              <Select.Option key={pkg.id} value={pkg.id}>
                {pkg.name} - ¥{pkg.discountPrice}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </ModalForm>
    </div>
  );
};

export default OrdersPage;
