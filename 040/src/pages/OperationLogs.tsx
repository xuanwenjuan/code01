import React, { useMemo, useState } from 'react'
import {
  Card,
  Table,
  Space,
  Tag,
  Select,
  DatePicker,
  Input,
  Button,
  Typography,
  Descriptions,
  Modal,
  Badge,
  Statistic,
  Row,
  Col,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { RangePickerProps } from 'antd/es/date-picker'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  UserOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import type { OperationLog, OperationType, Device } from '@/types'
import { OPERATION_TYPE_MAP, OPERATION_TYPE_COLORS } from '@/constants'
import { useDataStore } from '@/store/dataStore'
import { useFilterStore } from '@/store/filterStore'
import dayjs from 'dayjs'

const { Text, Title } = Typography
const { RangePicker } = DatePicker

const OperationLogs: React.FC = () => {
  const { operationLogs, devices } = useDataStore()
  const {
    operationFilters,
    setOperationFilter,
    resetOperationFilters,
    toggleOperationTypeFilter,
  } = useFilterStore()

  const [detailLog, setDetailLog] = useState<OperationLog | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  const operationTypeOptions = Object.entries(OPERATION_TYPE_MAP).map(
    ([value, label]) => ({
      label,
      value: value as OperationType,
    })
  )

  const operationTypeColors = OPERATION_TYPE_COLORS

  const filteredLogs = useMemo(() => {
    let result = [...operationLogs]

    if (operationFilters.operationTypes.length > 0) {
      result = result.filter((log) =>
        operationFilters.operationTypes.includes(log.operationType)
      )
    }

    if (operationFilters.startTime && operationFilters.endTime) {
      const start = new Date(operationFilters.startTime).getTime()
      const end = new Date(operationFilters.endTime).getTime()
      result = result.filter((log) => {
        const logTime = new Date(log.timestamp).getTime()
        return logTime >= start && logTime <= end
      })
    }

    if (operationFilters.keyword) {
      const keyword = operationFilters.keyword.toLowerCase()
      result = result.filter(
        (log) =>
          log.operator.toLowerCase().includes(keyword) ||
          log.details.toLowerCase().includes(keyword) ||
          log.deviceName?.toLowerCase().includes(keyword) ||
          log.areaName?.toLowerCase().includes(keyword)
      )
    }

    return result
  }, [operationLogs, operationFilters])

  const handleRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setOperationFilter({
        startTime: dates[0].toISOString(),
        endTime: dates[1].toISOString(),
      })
    } else {
      setOperationFilter({
        startTime: null,
        endTime: null,
      })
    }
  }

  const showDetail = (log: OperationLog) => {
    setDetailLog(log)
    setDetailModalVisible(true)
  }

  const relatedDevice = useMemo(() => {
    if (!detailLog || !detailLog.deviceId) return null
    return devices.find((d: Device) => d.id === detailLog.deviceId)
  }, [detailLog, devices])

  const columns: ColumnsType<OperationLog> = [
    {
      title: '操作时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      fixed: 'left' as const,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 150,
      filters: operationTypeOptions.map((opt) => ({
        text: opt.label,
        value: opt.value,
      })),
      onFilter: (value, record) => record.operationType === value,
      render: (type: OperationType) => (
        <Tag color={operationTypeColors[type]}>{OPERATION_TYPE_MAP[type]}</Tag>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      ),
    },
    {
      title: '操作详情',
      dataIndex: 'details',
      key: 'details',
      width: 220,
      ellipsis: true,
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 150,
      render: (name: string | undefined) => name || '-',
    },
    {
      title: '所属区域',
      dataIndex: 'areaName',
      key: 'areaName',
      width: 120,
      render: (name: string | undefined) => name || '-',
    },
    {
      title: '变更记录',
      key: 'change',
      width: 200,
      render: (_: unknown, record: OperationLog) => {
        if (record.beforeValue && record.afterValue) {
          return (
            <Space>
              <Text delete type="secondary">
                {record.beforeValue}
              </Text>
              <Text type="secondary">→</Text>
              <Text strong style={{ color: '#1890ff' }}>
                {record.afterValue}
              </Text>
            </Space>
          )
        }
        return <Text type="secondary">-</Text>
      },
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: OperationLog) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ]

  const operationStats = useMemo(() => {
    const stats: Record<OperationType, number> = {
      update_power: 0,
      dispatch_workorder: 0,
      add_inspection: 0,
      device_online: 0,
      device_offline: 0,
      create_device: 0,
      delete_device: 0,
      update_device: 0,
    }

    operationLogs.forEach((log) => {
      stats[log.operationType]++
    })

    return stats
  }, [operationLogs])

  const todayLogsCount = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return operationLogs.filter((log) => dayjs(log.timestamp).format('YYYY-MM-DD') === today).length
  }, [operationLogs])

  const hasActiveFilters =
    operationFilters.operationTypes.length > 0 ||
    operationFilters.startTime !== null ||
    operationFilters.endTime !== null ||
    operationFilters.keyword !== ''

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ height: '100%', borderLeft: '4px solid #1890ff' }}>
            <Statistic
              title={
                <Space>
                  <HistoryOutlined style={{ color: '#1890ff' }} />
                  <span>总操作记录</span>
                </Space>
              }
              value={operationLogs.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ height: '100%', borderLeft: '4px solid #52c41a' }}>
            <Statistic
              title={
                <Space>
                  <ThunderboltOutlined style={{ color: '#52c41a' }} />
                  <span>今日操作</span>
                </Space>
              }
              value={todayLogsCount}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ height: '100%', borderLeft: '4px solid #722ed1' }}>
            <Statistic
              title="设备变更"
              value={operationStats.create_device + operationStats.update_device + operationStats.delete_device}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ height: '100%', borderLeft: '4px solid #faad14' }}>
            <Statistic
              title="告警处理"
              value={operationStats.dispatch_workorder + operationStats.add_inspection}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Title level={5}>
          <Space>
            <ThunderboltOutlined style={{ color: '#1890ff' }} />
            操作类型统计
          </Space>
        </Title>
        <Space wrap size={[12, 12]} style={{ marginTop: 8 }}>
          {Object.entries(operationStats).map(([type, count]) => {
            const isSelected = operationFilters.operationTypes.includes(type as OperationType)
            return (
              <Tag
                key={type}
                color={isSelected ? 'blue' : operationTypeColors[type as OperationType]}
                style={{
                  fontSize: 14,
                  padding: '6px 16px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #1890ff' : 'none',
                }}
                onClick={() => toggleOperationTypeFilter(type as OperationType)}
              >
                <Badge count={count} color={operationTypeColors[type as OperationType]} offset={[6, -2]}>
                  {OPERATION_TYPE_MAP[type as OperationType]}
                </Badge>
              </Tag>
            )
          })}
        </Space>
        {hasActiveFilters && (
          <Space style={{ marginTop: 12 }}>
            <Text type="secondary">当前筛选条件：</Text>
            {operationFilters.operationTypes.length > 0 && (
              <Tag color="blue">
                操作类型: {operationFilters.operationTypes.map((t) => OPERATION_TYPE_MAP[t]).join(', ')}
              </Tag>
            )}
            {operationFilters.keyword && <Tag color="cyan">关键词: {operationFilters.keyword}</Tag>}
            {operationFilters.startTime && operationFilters.endTime && (
              <Tag color="purple">
                时间范围: {dayjs(operationFilters.startTime).format('YYYY-MM-DD')} ~{' '}
                {dayjs(operationFilters.endTime).format('YYYY-MM-DD')}
              </Tag>
            )}
            <Button type="link" size="small" onClick={resetOperationFilters}>
              清除筛选
            </Button>
          </Space>
        )}
      </Card>

      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Space wrap>
            <Input
              placeholder="搜索操作人、设备、详情..."
              prefix={<SearchOutlined />}
              value={operationFilters.keyword}
              onChange={(e) => setOperationFilter({ keyword: e.target.value })}
              allowClear
              style={{ width: 280 }}
            />
            <Select
              mode="multiple"
              placeholder="操作类型"
              value={operationFilters.operationTypes}
              onChange={(value) => setOperationFilter({ operationTypes: value })}
              style={{ width: 300 }}
              maxTagCount={3}
              options={operationTypeOptions}
            />
            <RangePicker
              showTime
              onChange={handleRangeChange}
              style={{ width: 320 }}
            />
            <Button icon={<ReloadOutlined />} onClick={resetOperationFilters}>
              重置
            </Button>
          </Space>
          <Text type="secondary">
            共 {filteredLogs.length} 条记录
            {filteredLogs.length !== operationLogs.length && ` (筛选后 ${filteredLogs.length})`}
          </Text>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="操作日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={720}
      >
        {detailLog && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="日志ID" span={2}>
                {detailLog.id}
              </Descriptions.Item>
              <Descriptions.Item label="操作时间" span={2}>
                {dayjs(detailLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="操作类型">
                <Tag color={operationTypeColors[detailLog.operationType]}>
                  {OPERATION_TYPE_MAP[detailLog.operationType]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="操作人">
                <Space>
                  <UserOutlined />
                  {detailLog.operator}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="操作详情" span={2}>
                {detailLog.details}
              </Descriptions.Item>
              {detailLog.beforeValue && (
                <Descriptions.Item label="变更前">
                  <Text delete type="secondary">
                    {detailLog.beforeValue}
                  </Text>
                </Descriptions.Item>
              )}
              {detailLog.afterValue && (
                <Descriptions.Item label="变更后">
                  <Text strong style={{ color: '#1890ff' }}>
                    {detailLog.afterValue}
                  </Text>
                </Descriptions.Item>
              )}
              {detailLog.deviceName && (
                <Descriptions.Item label="设备名称">
                  {detailLog.deviceName}
                </Descriptions.Item>
              )}
              {detailLog.deviceId && (
                <Descriptions.Item label="设备ID">
                  {detailLog.deviceId}
                </Descriptions.Item>
              )}
              {detailLog.areaName && (
                <Descriptions.Item label="所属区域">
                  {detailLog.areaName}
                </Descriptions.Item>
              )}
              {detailLog.areaId && (
                <Descriptions.Item label="区域ID">
                  {detailLog.areaId}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="IP地址" span={2}>
                {detailLog.ip}
              </Descriptions.Item>
            </Descriptions>

            {relatedDevice && (
              <Card
                size="small"
                title={
                  <Space>
                    <ThunderboltOutlined style={{ color: '#1890ff' }} />
                    关联设备当前状态
                  </Space>
                }
                type="inner"
              >
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic title="设备名称" value={relatedDevice.name} />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="当前状态"
                      value={
                        relatedDevice.status === 'online'
                          ? '在线'
                          : relatedDevice.status === 'offline'
                          ? '离线'
                          : relatedDevice.status === 'fault'
                          ? '故障'
                          : '维护中'
                      }
                      valueStyle={{
                        color:
                          relatedDevice.status === 'online'
                            ? '#52c41a'
                            : relatedDevice.status === 'fault'
                            ? '#ff4d4f'
                            : '#8c8c8c',
                      }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="当前功率"
                      value={relatedDevice.currentPower}
                      suffix="kW"
                    />
                  </Col>
                </Row>
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </Space>
  )
}

export default OperationLogs
