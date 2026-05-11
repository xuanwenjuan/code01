import React, { useMemo } from 'react';
import type { TableColumnsType, RangePickerProps } from 'antd';
import { Card, Table, Space, Tag, Input, Select, DatePicker, Row, Col, Button, Statistic } from 'antd';
import { SearchOutlined, FilterOutlined, HistoryOutlined, UserOutlined, FileTextOutlined, ShoppingCartOutlined, BarChartOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useAppStore, useFilteredLogs } from '@/store';
import { OperationTypeOptions, TargetTypeOptions } from '@/constants';
import type { OperationLog, OperationType, LogFilter } from '@/types';

const { RangePicker } = DatePicker;

type TargetType = 'customer' | 'order' | 'performance';

interface LogStats {
  todayLogs: OperationLog[];
  customerOps: number;
  orderOps: number;
  recentLogs: OperationLog[];
}

const OperationLogPage: React.FC = () => {
  const { logs, setLogFilter, logFilter } = useAppStore();
  const filteredLogs: OperationLog[] = useFilteredLogs();

  const stats: LogStats = useMemo(() => {
    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogs: OperationLog[] = logs.filter((l: OperationLog) => new Date(l.createTime) >= today);
    const customerOps: number = logs.filter((l: OperationLog) => l.targetType === 'customer').length;
    const orderOps: number = logs.filter((l: OperationLog) => l.targetType === 'order').length;
    const recentLogs: OperationLog[] = logs.slice(0, 10);
    
    return { todayLogs, customerOps, orderOps, recentLogs };
  }, [logs]);

  const getTypeLabel = (type: OperationType): string => {
    return OperationTypeOptions.find((o) => o.value === type)?.label || type;
  };

  const getTargetIcon = (targetType: TargetType): React.ReactNode => {
    switch (targetType) {
      case 'customer':
        return <UserOutlined style={{ color: '#1890ff' }} />;
      case 'order':
        return <ShoppingCartOutlined style={{ color: '#52c41a' }} />;
      case 'performance':
        return <BarChartOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getTypeColor = (type: OperationType): string => {
    if (type.includes('create')) return 'green';
    if (type.includes('update')) return 'blue';
    if (type.includes('delete')) return 'red';
    if (type.includes('adjust')) return 'orange';
    return 'default';
  };

  const getTargetLabel = (targetType: TargetType): string => {
    return TargetTypeOptions.find((o) => o.value === targetType)?.label || targetType;
  };

  const handleDateChange: RangePickerProps['onChange'] = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setLogFilter({
        ...logFilter,
        startTime: dates[0].format('YYYY-MM-DD'),
        endTime: dates[1].format('YYYY-MM-DD')
      });
    } else {
      const { startTime, endTime, ...rest }: LogFilter = logFilter;
      setLogFilter(rest);
    }
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setLogFilter({ ...logFilter, keyword: e.target.value });
  };

  const handleTypeChange = (value: OperationType | undefined): void => {
    setLogFilter({ ...logFilter, type: value });
  };

  const handleTargetTypeChange = (value: TargetType | undefined): void => {
    setLogFilter({ ...logFilter, targetType: value });
  };

  const handleResetFilter = (): void => {
    setLogFilter({});
  };

  const columns: TableColumnsType<OperationLog> = [
    {
      title: '操作类型',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      filters: OperationTypeOptions.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value: string | number | boolean, record: OperationLog) => record.type === value,
      render: (type: OperationType) => (
        <Tag color={getTypeColor(type)}>{getTypeLabel(type)}</Tag>
      )
    },
    {
      title: '目标类型',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 100,
      filters: TargetTypeOptions.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value: string | number | boolean, record: OperationLog) => record.targetType === value,
      render: (targetType: TargetType) => (
        <Space>
          {getTargetIcon(targetType)}
          <span>{getTargetLabel(targetType)}</span>
        </Space>
      )
    },
    {
      title: '操作描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (text: string, record: OperationLog) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.oldValue && record.newValue && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {record.oldValue} → {record.newValue}
            </div>
          )}
        </div>
      )
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      sorter: (a: OperationLog, b: OperationLog) => 
        new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日操作数"
              value={stats.todayLogs.length}
              prefix={<HistoryOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="客户相关操作"
              value={stats.customerOps}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="订单相关操作"
              value={stats.orderOps}
              prefix={<ShoppingCartOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总日志数"
              value={logs.length}
              prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <FilterOutlined />
            <span>日志筛选</span>
          </Space>
        }
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="搜索描述、操作人"
              prefix={<SearchOutlined />}
              value={logFilter.keyword}
              onChange={handleKeywordChange}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select<OperationType>
              placeholder="操作类型"
              allowClear
              style={{ width: '100%' }}
              value={logFilter.type}
              onChange={handleTypeChange}
            >
              {OperationTypeOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select<TargetType>
              placeholder="目标类型"
              allowClear
              style={{ width: '100%' }}
              value={logFilter.targetType}
              onChange={handleTargetTypeChange}
            >
              {TargetTypeOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
              onChange={handleDateChange}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              onClick={handleResetFilter}
              style={{ width: '100%' }}
            >
              重置筛选
            </Button>
          </Col>
        </Row>
      </Card>

      <Card title="操作日志记录">
        <Table<OperationLog>
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number) => `共 ${total} 条记录`,
            defaultPageSize: 20
          }}
        />
      </Card>
    </div>
  );
};

export default OperationLogPage;
