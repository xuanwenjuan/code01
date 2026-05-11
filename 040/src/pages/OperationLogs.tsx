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
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { RangePickerProps } from 'antd/es/date-picker'
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import type { OperationLog, OperationType } from '@/types'
import { OPERATION_TYPE_MAP } from '@/constants'
import { useDataStore } from '@/store/dataStore'
import { useFilterStore } from '@/store/filterStore'
import dayjs from 'dayjs'

const { Text, Title } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const OperationLogs: React.FC = () => {
  const { operationLogs } = useDataStore()
  const { operationFilters, setOperationFilter, resetOperationFilters, toggleOperationTypeFilter } = useFilterStore()
  const [detailLog, setDetailLog] = useState<OperationLog | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  const operationTypeOptions = Object.entries(OPERATION_TYPE_MAP).map(([value, label]) => ({
    label,
    value: value as OperationType,
  }))

  const filteredLogs = useMemo(() => {
    let result = [...operationLogs]

    if (operationFilters.operationTypes.length > 0) {
      result = result.filter(log => operationFilters.operationTypes.includes(log.operationType))
    }

    if (operationFilters.startTime && operationFilters.endTime) {
      const start = new Date(operationFilters.startTime).getTime()
      const end = new Date(operationFilters.endTime).getTime()
      result = result.filter(log => {
        const logTime = new Date(log.timestamp).getTime()
        return logTime >= start && logTime <= end
      })
    }

    if (operationFilters.keyword) {
      const keyword = operationFilters.keyword.toLowerCase()
      result = result.filter(log =>
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

  const columns: ColumnsType<OperationLog> = [
    {
      title: '操作时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      fixed: 'left' as const,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 150,
      filters: operationTypeOptions.map(opt => ({
        text: opt.label,
        value: opt.value,
      })),
      onFilter: (value, record) => record.operationType === value,
      render: (type: OperationType) => {
        const tagColors: Record<OperationType, string> = {
          update_power: 'blue',
          dispatch_workorder: 'orange',
          add_inspection: 'green',
          device_online: 'cyan',
          device_offline: 'default',
          create_device: 'purple',
          delete_device: 'red',
          update_device: 'geekblue',
        }
        return <Tag color={tagColors[type]}>{OPERATION_TYPE_MAP[type]}</Tag>
      },
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '操作详情',
      dataIndex: 'details',
      key: 'details',
      width: 200,
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
      width: 150,
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
              <Text delete type="secondary">{record.beforeValue}</Text>
              <Text type="secondary">→</Text>
              <Text strong>{record.afterValue}</Text>
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

    operationLogs.forEach(log => {
      stats[log.operationType]++
    })

    return stats
  }, [operationLogs])

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Title level={5}>操作统计</Title>
        <Space wrap size={[16, 16]}>
          {Object.entries(operationStats).map(([type, count]) => (
            <Tag
              key={type}
              color="blue"
              style={{ fontSize: 14, padding: '4px 12px', cursor: 'pointer' }}
              onClick={() => toggleOperationTypeFilter(type as OperationType)}
            >
              {OPERATION_TYPE_MAP[type as OperationType]}: {count}
            </Tag>
          ))}
        </Space>
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
            >
              {operationTypeOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
            <RangePicker
              showTime
              onChange={handleRangeChange}
              style={{ width: 320 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={resetOperationFilters}
            >
              重置
            </Button>
          </Space>
          <Text type="secondary">共 {filteredLogs.length} 条记录</Text>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          scroll={{ x: 1300 }}
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
        width={700}
      >
        {detailLog && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="日志ID" span={2}>
              {detailLog.id}
            </Descriptions.Item>
            <Descriptions.Item label="操作时间" span={2}>
              {dayjs(detailLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="操作类型">
              <Tag>{OPERATION_TYPE_MAP[detailLog.operationType]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="操作人">
              {detailLog.operator}
            </Descriptions.Item>
            <Descriptions.Item label="操作详情" span={2}>
              {detailLog.details}
            </Descriptions.Item>
            <Descriptions.Item label="设备名称">
              {detailLog.deviceName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="设备ID">
              {detailLog.deviceId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="所属区域">
              {detailLog.areaName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="区域ID">
              {detailLog.areaId || '-'}
            </Descriptions.Item>
            {detailLog.beforeValue && (
              <Descriptions.Item label="变更前">
                {detailLog.beforeValue}
              </Descriptions.Item>
            )}
            {detailLog.afterValue && (
              <Descriptions.Item label="变更后">
                {detailLog.afterValue}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="IP地址" span={2}>
              {detailLog.ip}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Space>
  )
}

export default OperationLogs
