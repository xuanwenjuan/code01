import React, { useState, useMemo, useCallback } from 'react';
import { Card, Table, Button, Space, Tag, Popconfirm, message, Input, Select, Statistic, Row, Col, Form, TextArea, Dropdown, Tooltip, InputNumber, Descriptions, Divider, Progress } from 'antd';
import type { TableColumnsType, MenuProps } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  UserOutlined, 
  FilterOutlined, 
  MoreOutlined, 
  FileTextOutlined, 
  ShoppingCartOutlined, 
  SafetyCertificateOutlined,
  RiseOutlined,
  BarChartOutlined,
  EyeOutlined
} from '@ant-design/icons';
import CustomerModal from '@/components/CustomerModal';
import OrderModal from '@/components/OrderModal';
import CommonModal from '@/components/CommonModal';
import { useAppStore, useFilteredCustomers, useValueStats } from '@/store';
import { 
  CustomerCategoryOptions, 
  CustomerLevelOptions, 
  CustomerStatusOptions,
  ValueTierOptions,
  CustomerCategoryMap,
  CustomerLevelMap,
  CustomerStatusMap,
  ValueTierMap
} from '@/constants';
import { formatCurrency, CUSTOMER_LEVEL_MULTIPLIERS } from '@/utils/valueCalculator';
import type { 
  CustomerWithValue, 
  CustomerCategory, 
  CustomerLevel, 
  CustomerStatus, 
  ValueTier,
  NoteFormValues,
  LevelFormValues,
  CustomerFilter,
  ValueStats
} from '@/types';

interface CustomerStats {
  total: number;
  cooperating: number;
  enterprise: number;
  highLevel: number;
  totalValue: number;
  avgValue: number;
  highValueCount: number;
  ultraHighCount: number;
}

const CustomerManagement: React.FC = () => {
  const [customerModalOpen, setCustomerModalOpen] = useState<boolean>(false);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [noteModalOpen, setNoteModalOpen] = useState<boolean>(false);
  const [levelModalOpen, setLevelModalOpen] = useState<boolean>(false);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerWithValue | null>(null);
  const [selectedCustomerForOrder, setSelectedCustomerForOrder] = useState<string | undefined>(undefined);
  const [noteForm] = Form.useForm<NoteFormValues>();
  const [levelForm] = Form.useForm<LevelFormValues>();

  const {
    deleteCustomer,
    updateCustomerLevel,
    addFollowUpNote,
    setCustomerFilter,
    customerFilter
  } = useAppStore();
  
  const filteredCustomers: CustomerWithValue[] = useFilteredCustomers();
  const valueStats: ValueStats = useValueStats();

  const stats: CustomerStats = useMemo((): CustomerStats => {
    const cooperating: number = filteredCustomers.filter((c: CustomerWithValue) => c.status === 'cooperating').length;
    const enterprise: number = filteredCustomers.filter((c: CustomerWithValue) => c.category === 'enterprise').length;
    const highLevel: number = filteredCustomers.filter((c: CustomerWithValue) => c.level === 'A' || c.level === 'B').length;
    return { 
      total: filteredCustomers.length, 
      cooperating, 
      enterprise, 
      highLevel,
      totalValue: valueStats.totalValue,
      avgValue: valueStats.avgValue,
      highValueCount: valueStats.highValueCount,
      ultraHighCount: valueStats.ultraHighCount
    };
  }, [filteredCustomers, valueStats]);

  const handleKeywordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setCustomerFilter({ ...customerFilter, keyword: e.target.value });
  }, [customerFilter, setCustomerFilter]);

  const handleCategoryChange = useCallback((value: CustomerCategory | undefined): void => {
    setCustomerFilter({ ...customerFilter, category: value });
  }, [customerFilter, setCustomerFilter]);

  const handleLevelChange = useCallback((value: CustomerLevel | undefined): void => {
    setCustomerFilter({ ...customerFilter, level: value });
  }, [customerFilter, setCustomerFilter]);

  const handleStatusChange = useCallback((value: CustomerStatus | undefined): void => {
    setCustomerFilter({ ...customerFilter, status: value });
  }, [customerFilter, setCustomerFilter]);

  const handleValueTierChange = useCallback((value: ValueTier | undefined): void => {
    setCustomerFilter({ ...customerFilter, valueTier: value });
  }, [customerFilter, setCustomerFilter]);

  const handleMinValueChange = useCallback((value: number | null): void => {
    setCustomerFilter({ ...customerFilter, minValue: value ?? undefined });
  }, [customerFilter, setCustomerFilter]);

  const handleMaxValueChange = useCallback((value: number | null): void => {
    setCustomerFilter({ ...customerFilter, maxValue: value ?? undefined });
  }, [customerFilter, setCustomerFilter]);

  const handleFilterReset = useCallback((): void => {
    setCustomerFilter({});
  }, [setCustomerFilter]);

  const handleEdit = useCallback((customer: CustomerWithValue): void => {
    setCurrentCustomer(customer);
    setCustomerModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string): void => {
    deleteCustomer(id);
    message.success('客户已删除');
  }, [deleteCustomer]);

  const handleAddOrder = useCallback((customerId: string): void => {
    setSelectedCustomerForOrder(customerId);
    setOrderModalOpen(true);
  }, []);

  const handleAddNote = useCallback((customer: CustomerWithValue): void => {
    setCurrentCustomer(customer);
    noteForm.resetFields();
    setNoteModalOpen(true);
  };

  const handleChangeLevel = (customer: CustomerWithValue): void => {
    setCurrentCustomer(customer);
    levelForm.setFieldsValue({ level: customer.level });
    setLevelModalOpen(true);
  };

  const handleViewDetail = (customer: CustomerWithValue): void => {
    setCurrentCustomer(customer);
    setDetailModalOpen(true);
  };

  const submitNote = async (): Promise<void> => {
    const values: NoteFormValues = await noteForm.validateFields();
    if (currentCustomer) {
      addFollowUpNote(currentCustomer.id, values.note);
      message.success('跟进备注已添加');
      setNoteModalOpen(false);
    }
  };

  const submitLevel = async (): Promise<void> => {
    const values: LevelFormValues = await levelForm.validateFields();
    if (currentCustomer && values.level !== currentCustomer.level) {
      updateCustomerLevel(currentCustomer.id, values.level);
      message.success('客户等级已更新');
    }
    setLevelModalOpen(false);
  };

  const getValueTierTag = (valueTier: ValueTier): React.ReactNode => {
    const tierInfo = ValueTierMap[valueTier];
    return (
      <Tag color={valueTier === 'ultra_high' ? 'red' : valueTier === 'high' ? 'orange' : valueTier === 'medium' ? 'blue' : 'default'}>
        {tierInfo.label}
      </Tag>
    );
  };

  const getActionMenuItems = (record: CustomerWithValue): MenuProps['items'] => {
    return [
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: '查看详情',
        onClick: () => handleViewDetail(record)
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑客户',
        onClick: () => handleEdit(record)
      },
      {
        key: 'order',
        icon: <ShoppingCartOutlined />,
        label: '新建订单',
        onClick: () => handleAddOrder(record.id)
      },
      {
        key: 'note',
        icon: <FileTextOutlined />,
        label: '添加备注',
        onClick: () => handleAddNote(record)
      },
      {
        key: 'level',
        icon: <SafetyCertificateOutlined />,
        label: '调整等级',
        onClick: () => handleChangeLevel(record)
      },
      { type: 'divider' },
      {
        key: 'delete',
        icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
        label: (
          <Popconfirm
            title="确定删除该客户吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <span style={{ color: '#ff4d4f' }}>删除客户</span>
          </Popconfirm>
        )
      }
    ];
  };

  const columns: TableColumnsType<CustomerWithValue> = [
    {
      title: '客户分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      filters: CustomerCategoryOptions.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.category === (value as CustomerCategory),
      render: (category: CustomerCategory) => (
        <Tag color="blue">{CustomerCategoryMap[category]}</Tag>
      )
    },
    {
      title: '公司名称',
      dataIndex: 'companyName',
      key: 'companyName',
      fixed: 'left' as const,
      width: 180,
      render: (text: string, record: CustomerWithValue) => (
        <Space>
          <UserOutlined />
          <span style={{ fontWeight: 500 }}>{text}</span>
          {record.followUpNotes && (
            <Tooltip title="有跟进记录">
              <FileTextOutlined style={{ color: '#faad14' }} />
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 100
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130
    },
    {
      title: '客户等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      filters: CustomerLevelOptions.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.level === (value as CustomerLevel),
      render: (level: CustomerLevel) => (
        <Tag color={level === 'A' ? 'gold' : level === 'B' ? 'blue' : level === 'C' ? 'green' : 'default'}>
          {CustomerLevelMap[level]}
        </Tag>
      )
    },
    {
      title: '合作状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: CustomerStatusOptions.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.status === (value as CustomerStatus),
      render: (status: CustomerStatus) => {
        const option = CustomerStatusOptions.find((o) => o.value === status);
        return <Tag color={option?.color}>{CustomerStatusMap[status]}</Tag>;
      }
    },
    {
      title: '价值评级',
      dataIndex: ['valueInfo', 'valueTier'],
      key: 'valueTier',
      width: 110,
      filters: ValueTierOptions.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.valueInfo.valueTier === (value as ValueTier),
      render: (valueTier: ValueTier) => getValueTierTag(valueTier)
    },
    {
      title: '加权价值',
      dataIndex: ['valueInfo', 'weightedValue'],
      key: 'weightedValue',
      width: 130,
      sorter: (a, b) => a.valueInfo.weightedValue - b.valueInfo.weightedValue,
      render: (weightedValue: number, record) => (
        <Tooltip title={`系数: x${record.valueInfo.levelMultiplier} (${CustomerLevelMap[record.level]})`}>
          <span style={{ fontWeight: 500, color: ValueTierMap[record.valueInfo.valueTier].color }}>
            {formatCurrency(weightedValue)}
          </span>
        </Tooltip>
      )
    },
    {
      title: '订单数',
      dataIndex: ['valueInfo', 'orderCount'],
      key: 'orderCount',
      width: 80,
      render: (orderCount: number) => orderCount
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: CustomerWithValue) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  const handleNewCustomer = useCallback((): void => {
    setCurrentCustomer(null);
    setCustomerModalOpen(true);
  }, []);

  const handleCloseCustomerModal = useCallback((): void => {
    setCustomerModalOpen(false);
  }, []);

  const handleCloseOrderModal = useCallback((): void => {
    setOrderModalOpen(false);
    setSelectedCustomerForOrder(undefined);
  }, []);

  const handleCloseNoteModal = useCallback((): void => {
    setNoteModalOpen(false);
  }, []);

  const handleCloseLevelModal = useCallback((): void => {
    setLevelModalOpen(false);
  }, []);

  const handleCloseDetailModal = useCallback((): void => {
    setDetailModalOpen(false);
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="客户总数"
              value={stats.total}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总客户价值"
              value={stats.totalValue}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              precision={0}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="超高价值客户"
              value={stats.ultraHighCount}
              prefix={<BarChartOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="平均客户价值"
              value={stats.avgValue}
              precision={0}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <FilterOutlined />
            <span>高级筛选</span>
          </Space>
        }
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="搜索公司名称、联系人、电话"
              prefix={<SearchOutlined />}
              value={customerFilter.keyword}
              onChange={handleKeywordChange}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select<CustomerCategory>
              placeholder="客户分类"
              allowClear
              style={{ width: '100%' }}
              value={customerFilter.category}
              onChange={handleCategoryChange}
            >
              {CustomerCategoryOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select<CustomerLevel>
              placeholder="客户等级"
              allowClear
              style={{ width: '100%' }}
              value={customerFilter.level}
              onChange={handleLevelChange}
            >
              {CustomerLevelOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select<CustomerStatus>
              placeholder="合作状态"
              allowClear
              style={{ width: '100%' }}
              value={customerFilter.status}
              onChange={handleStatusChange}
            >
              {CustomerStatusOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select<ValueTier>
              placeholder="价值评级"
              allowClear
              style={{ width: '100%' }}
              value={customerFilter.valueTier}
              onChange={handleValueTierChange}
            >
              {ValueTierOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <InputNumber
              placeholder="最小价值"
              style={{ width: '100%' }}
              value={customerFilter.minValue}
              onChange={handleMinValueChange}
              min={0}
              addonBefore="≥"
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <InputNumber
              placeholder="最大价值"
              style={{ width: '100%' }}
              value={customerFilter.maxValue}
              onChange={handleMaxValueChange}
              min={0}
              addonBefore="≤"
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Button onClick={handleFilterReset} style={{ width: '100%' }}>
              重置筛选
            </Button>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewCustomer}
              style={{ width: '100%' }}
            >
              新建客户
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <CustomerModal
        open={customerModalOpen}
        onClose={handleCloseCustomerModal}
        customer={currentCustomer}
      />

      <OrderModal
        open={orderModalOpen}
        onClose={handleCloseOrderModal}
        defaultCustomerId={selectedCustomerForOrder}
      />

      <CommonModal
        title="添加跟进备注"
        open={noteModalOpen}
        onClose={handleCloseNoteModal}
        onConfirm={submitNote}
        width={500}
      >
        <Form form={noteForm} layout="vertical">
          <Form.Item<NoteFormValues>
            name="note"
            label="跟进内容"
            rules={[{ required: true, message: '请输入跟进内容' }]}
          >
            <TextArea rows={6} placeholder="请输入客户跟进内容..." />
          </Form.Item>
        </Form>
      </CommonModal>

      <CommonModal
        title="调整客户等级"
        open={levelModalOpen}
        onClose={handleCloseLevelModal}
        onConfirm={submitLevel}
        width={400}
      >
        <Form form={levelForm} layout="vertical">
          <Form.Item<LevelFormValues>
            name="level"
            label="客户等级"
            rules={[{ required: true, message: '请选择客户等级' }]}
            extra="等级越高，客户价值系数越大：A级x2.0、B级x1.5、C级x1.0、D级x0.7"
          >
            <Select placeholder="请选择客户等级">
              {CustomerLevelOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label} (系数x{CUSTOMER_LEVEL_MULTIPLIERS[item.value]})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </CommonModal>

      {currentCustomer && (
        <CommonModal
          title={`客户详情 - ${currentCustomer.companyName}`}
          open={detailModalOpen}
          onClose={handleCloseDetailModal}
          width={700}
          footer={null}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="公司名称" span={2}>
                {currentCustomer.companyName}
              </Descriptions.Item>
              <Descriptions.Item label="联系人">
                {currentCustomer.contact}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {currentCustomer.phone}
              </Descriptions.Item>
              <Descriptions.Item label="客户分类">
                <Tag color="blue">{CustomerCategoryMap[currentCustomer.category]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="客户等级">
                <Tag>{CustomerLevelMap[currentCustomer.level]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="合作状态">
                <Tag>{CustomerStatusMap[currentCustomer.status]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="价值评级">
                {getValueTierTag(currentCustomer.valueInfo.valueTier)}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '8px 0' }}>价值分析</Divider>
            
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Card size="small" title="订单统计">
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999' }}>订单数量：</span>
                      <span style={{ fontWeight: 500 }}>{currentCustomer.valueInfo.orderCount} 笔</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999' }}>累计金额：</span>
                      <span style={{ fontWeight: 500 }}>
                        {formatCurrency(currentCustomer.valueInfo.totalOrderAmount)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999' }}>完成金额：</span>
                      <span style={{ fontWeight: 500 }}>
                        {formatCurrency(currentCustomer.valueInfo.completedAmount)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999' }}>平均金额：</span>
                      <span style={{ fontWeight: 500 }}>
                        {formatCurrency(currentCustomer.valueInfo.avgOrderAmount)}
                      </span>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="价值计算">
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999' }}>等级系数：</span>
                      <span style={{ fontWeight: 500 }}>
                        x{currentCustomer.valueInfo.levelMultiplier}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999' }}>加权价值：</span>
                      <span style={{ fontWeight: 500, color: ValueTierMap[currentCustomer.valueInfo.valueTier].color }}>
                        {formatCurrency(currentCustomer.valueInfo.weightedValue)}
                      </span>
                    </div>
                    {currentCustomer.valueInfo.lastOrderTime && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#999' }}>最后下单：</span>
                        <span style={{ fontWeight: 500 }}>
                          {currentCustomer.valueInfo.lastOrderTime}
                        </span>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>

            <Divider style={{ margin: '8px 0' }}>价值分布</Divider>
            
            <div style={{ padding: '8px 16px' }}>
              <Progress
                percent={Math.min(100, (currentCustomer.valueInfo.weightedValue / 500000) * 100)}
                status={
                  currentCustomer.valueInfo.valueTier === 'ultra_high' 
                    ? 'success' 
                    : currentCustomer.valueInfo.valueTier === 'high' 
                      ? 'active' 
                      : 'normal'
                }
                format={() => `当前: ${formatCurrency(currentCustomer.valueInfo.weightedValue)} / 目标: ¥500,000`}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#999' }}>
                <span>低价值 (0-5万)</span>
                <span>中价值 (5-20万)</span>
                <span>高价值 (20-50万)</span>
                <span>超高价值 (50万+)</span>
              </div>
            </div>

            {currentCustomer.followUpNotes && (
              <>
                <Divider style={{ margin: '8px 0' }}>跟进记录</Divider>
                <Card size="small" style={{ whiteSpace: 'pre-wrap' }}>
                  {currentCustomer.followUpNotes}
                </Card>
              </>
            )}
          </Space>
        </CommonModal>
      )}
    </div>
  );
};

export default CustomerManagement;
