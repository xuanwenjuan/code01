import React, { useMemo, useState } from 'react'
import {
  Card,
  Table,
  Space,
  Button,
  Popconfirm,
  message,
  Tag,
  Input,
  Tabs,
  Typography,
  Row,
  Col,
  Tooltip,
  Progress,
  Descriptions,
  Modal,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  AreaChartOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import type { DeviceWithLoadRate, LoadLevel } from '@/types'
import { DEVICE_TYPE_MAP, AREA_TYPE_MAP, LOAD_LEVEL_MAP } from '@/constants'
import { DeviceStatusTag, MonitorStatusTag, LoadRateTag, LoadLevelBadge } from '@/components/StatusTags'
import AdvancedFilter from '@/components/AdvancedFilter'
import DeviceModal from '@/components/modals/DeviceModal'
import { useDataStore } from '@/store/dataStore'
import { useFilterStore } from '@/store/filterStore'
import { calculateLoadRate } from '@/utils'
import dayjs from 'dayjs'

const { Text, Title } = Typography

const DeviceManagement: React.FC = () => {
  const {
    areas,
    devices,
    openDeviceModal,
    deleteDevice,
    currentDevice,
    isDeviceModalOpen,
    closeDeviceModal,
    devicesWithLoadRate,
  } = useDataStore()
  const { deviceFilters, resetDeviceFilters } = useFilterStore()
  const [searchText, setSearchText] = useState('')
  const [activeArea, setActiveArea] = useState('all')
  const [detailDevice, setDetailDevice] = useState<DeviceWithLoadRate | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  const filteredDevices = useMemo(() => {
    let result = [...devicesWithLoadRate]

    if (activeArea !== 'all') {
      result = result.filter((d) => d.areaId === activeArea)
    }

    if (deviceFilters.areaIds.length > 0) {
      result = result.filter((d) => deviceFilters.areaIds.includes(d.areaId))
    }

    if (deviceFilters.deviceStatuses.length > 0) {
      result = result.filter((d) => deviceFilters.deviceStatuses.includes(d.status))
    }

    if (deviceFilters.monitorStatuses.length > 0) {
      result = result.filter((d) => deviceFilters.monitorStatuses.includes(d.monitorStatus))
    }

    if (deviceFilters.minPower !== null) {
      result = result.filter((d) => d.currentPower >= deviceFilters.minPower!)
    }

    if (deviceFilters.maxPower !== null) {
      result = result.filter((d) => d.currentPower <= deviceFilters.maxPower!)
    }

    if (deviceFilters.minLoadRate !== null) {
      result = result.filter((d) => d.loadRate >= deviceFilters.minLoadRate!)
    }

    if (deviceFilters.maxLoadRate !== null) {
      result = result.filter((d) => d.loadRate <= deviceFilters.maxLoadRate!)
    }

    if (searchText) {
      const keyword = searchText.toLowerCase()
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(keyword) ||
          d.code.toLowerCase().includes(keyword) ||
          d.manufacturer.toLowerCase().includes(keyword)
      )
    }

    if (deviceFilters.keyword) {
      const keyword = deviceFilters.keyword.toLowerCase()
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(keyword) ||
          d.code.toLowerCase().includes(keyword) ||
          d.manufacturer.toLowerCase().includes(keyword)
      )
    }

    return result
  }, [devicesWithLoadRate, activeArea, deviceFilters, searchText])

  const getLoadRateProgress = (record: DeviceWithLoadRate) => {
    const loadRate = record.loadRate
    const loadLevel = record.loadLevel

    const colorMap: Record<LoadLevel, string> = {
      low: '#52c41a',
      normal: '#1890ff',
      high: '#faad14',
      overload: '#ff4d4f',
    }

    return (
      <Tooltip title={`负载率: ${loadRate.toFixed(1)}% - ${LOAD_LEVEL_MAP[loadLevel].text}`}>
        <div style={{ width: 140 }}>
          <Progress
            percent={Math.min(loadRate, 100)}
            size="small"
            strokeColor={colorMap[loadLevel]}
            format={() => <span style={{ fontSize: 12 }}>{loadRate.toFixed(1)}%</span>}
          />
        </div>
      </Tooltip>
    )
  }

  const columns: ColumnsType<DeviceWithLoadRate> = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: 180,
      render: (text: string, record: DeviceWithLoadRate) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.code}
          </Text>
        </Space>
      ),
    },
    {
      title: '设备类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      filters: Object.entries(DEVICE_TYPE_MAP).map(([value, text]) => ({
        text,
        value,
      })),
      onFilter: (value, record) => record.type === value,
      render: (type: DeviceWithLoadRate['type']) => DEVICE_TYPE_MAP[type],
    },
    {
      title: '所属区域',
      dataIndex: 'areaName',
      key: 'areaName',
      width: 120,
      filters: areas.map((area) => ({
        text: area.name,
        value: area.id,
      })),
      onFilter: (value, record) => record.areaId === value,
    },
    {
      title: '设备状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '在线', value: 'online' },
        { text: '离线', value: 'offline' },
        { text: '故障', value: 'fault' },
        { text: '维护中', value: 'maintenance' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: DeviceWithLoadRate['status']) => <DeviceStatusTag status={status} />,
    },
    {
      title: '监控状态',
      dataIndex: 'monitorStatus',
      key: 'monitorStatus',
      width: 100,
      filters: [
        { text: '正常', value: 'normal' },
        { text: '预警', value: 'warning' },
        { text: '告警', value: 'alarm' },
      ],
      onFilter: (value, record) => record.monitorStatus === value,
      render: (status: DeviceWithLoadRate['monitorStatus']) => {
        if (status === 'alarm' || status === 'warning') {
          return (
            <Tag icon={<ExclamationCircleOutlined />} color={status === 'alarm' ? 'red' : 'orange'}>
              <MonitorStatusTag status={status} />
            </Tag>
          )
        }
        return <MonitorStatusTag status={status} />
      },
    },
    {
      title: '额定功率',
      dataIndex: 'ratedPower',
      key: 'ratedPower',
      width: 100,
      align: 'right' as const,
      render: (value: number) => `${value} kW`,
      sorter: (a, b) => a.ratedPower - b.ratedPower,
    },
    {
      title: '当前功率',
      dataIndex: 'currentPower',
      key: 'currentPower',
      width: 100,
      align: 'right' as const,
      render: (value: number, record: DeviceWithLoadRate) => {
        const isHigh = value > record.ratedPower * 0.9
        const isOverload = value > record.ratedPower
        return (
          <span style={{ color: isOverload ? '#ff4d4f' : isHigh ? '#faad14' : undefined }}>
            {value} kW
            {isOverload && <Tag color="red">过载</Tag>}
            {!isOverload && isHigh && <Tag color="orange">高负载</Tag>}
          </span>
        )
      },
      sorter: (a, b) => a.currentPower - b.currentPower,
    },
    {
      title: '负载率',
      dataIndex: 'loadRate',
      key: 'loadRate',
      width: 160,
      render: (_, record) => getLoadRateProgress(record),
      sorter: (a, b) => a.loadRate - b.loadRate,
    },
    {
      title: '负载级别',
      dataIndex: 'loadLevel',
      key: 'loadLevel',
      width: 100,
      filters: [
        { text: '低负载', value: 'low' },
        { text: '正常', value: 'normal' },
        { text: '高负载', value: 'high' },
        { text: '过载', value: 'overload' },
      ],
      onFilter: (value, record) => record.loadLevel === value,
      render: (level: LoadLevel) => <LoadLevelBadge loadLevel={level} />,
    },
    {
      title: '电压',
      dataIndex: 'voltage',
      key: 'voltage',
      width: 100,
      align: 'right' as const,
      render: (value: number) => {
        const isAbnormal = value < 200 || value > 240
        return (
          <span style={{ color: isAbnormal ? '#faad14' : undefined }}>
            {value} V
            {isAbnormal && <Tag color="orange">异常</Tag>}
          </span>
        )
      },
      sorter: (a, b) => a.voltage - b.voltage,
    },
    {
      title: '电流',
      dataIndex: 'current',
      key: 'current',
      width: 100,
      align: 'right' as const,
      render: (value: number) => `${value} A`,
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 100,
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdateTime',
      key: 'lastUpdateTime',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 200,
      render: (_: unknown, record: DeviceWithLoadRate) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setDetailDevice(record)
              setDetailModalVisible(true)
            }}
          >
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openDeviceModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此设备吗？"
            onConfirm={() => {
              deleteDevice(record.id)
              message.success('设备已删除')
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const areaStats = useMemo(() => {
    return areas.map((area) => {
      const areaDevices = devices.filter((d) => d.areaId === area.id)
      const online = areaDevices.filter((d) => d.status === 'online').length
      const fault = areaDevices.filter((d) => d.status === 'fault').length
      const warning = areaDevices.filter(
        (d) => d.monitorStatus === 'warning' || d.monitorStatus === 'alarm'
      ).length
      const areaLoadRates = areaDevices
        .filter((d) => d.status === 'online' && d.ratedPower > 0)
        .map((d) => calculateLoadRate(d.currentPower, d.ratedPower))

      const avgLoadRate =
        areaLoadRates.length > 0
          ? areaLoadRates.reduce((sum, rate) => sum + rate, 0) / areaLoadRates.length
          : 0

      return {
        ...area,
        total: areaDevices.length,
        online,
        fault,
        warning,
        avgLoadRate,
      }
    })
  }, [areas, devices])

  const tabItems = [
    {
      key: 'all',
      label: (
        <Space>
          <AreaChartOutlined />
          <span>全部设备</span>
          <Tag>{filteredDevices.length}</Tag>
        </Space>
      ),
    },
    ...areaStats.map((area) => ({
      key: area.id,
      label: (
        <Space>
          <span>{AREA_TYPE_MAP[area.type]}</span>
          <Tag>{area.total}</Tag>
          {area.online < area.total && <Tag color="default">离线:{area.total - area.online}</Tag>}
          {area.fault > 0 && <Tag color="red">故障:{area.fault}</Tag>}
          {area.warning > 0 && <Tag color="orange">预警:{area.warning}</Tag>}
        </Space>
      ),
    })),
  ]

  const overallStats = useMemo(() => {
    const onlineDevices = devices.filter((d) => d.status === 'online')
    const loadRates = onlineDevices
      .filter((d) => d.ratedPower > 0)
      .map((d) => calculateLoadRate(d.currentPower, d.ratedPower))

    return {
      total: devices.length,
      online: onlineDevices.length,
      offline: devices.filter((d) => d.status === 'offline').length,
      fault: devices.filter((d) => d.status === 'fault').length,
      maintenance: devices.filter((d) => d.status === 'maintenance').length,
      avgLoadRate:
        loadRates.length > 0 ? loadRates.reduce((sum, rate) => sum + rate, 0) / loadRates.length : 0,
      highLoad: devices.filter((d) => calculateLoadRate(d.currentPower, d.ratedPower) >= 80).length,
    }
  }, [devices])

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderTop: '3px solid #1890ff',
            }}
          >
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>总体设备统计</Text>
                <ThunderboltOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">总数: {overallStats.total}</Text>
                <Text type="secondary">在线: {overallStats.online}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">平均负载: {overallStats.avgLoadRate.toFixed(1)}%</Text>
                <Text type="secondary">高负载: {overallStats.highLoad}</Text>
              </div>
            </Space>
          </Card>
        </Col>
        {areaStats.map((area) => (
          <Col key={area.id} xs={24} sm={12} md={6}>
            <Card
              size="small"
              style={{
                borderTop: `3px solid ${area.fault > 0 ? '#ff4d4f' : area.warning > 0 ? '#faad14' : '#52c41a'}`,
              }}
            >
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{area.name}</Text>
                  <ThunderboltOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">总数: {area.total}</Text>
                  <Text type="secondary">在线: {area.online}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">平均负载: {area.avgLoadRate.toFixed(1)}%</Text>
                  {area.avgLoadRate >= 80 && <Tag color="orange">⚠</Tag>}
                </div>
                {area.fault > 0 && (
                  <Text type="danger" style={{ fontSize: 12 }}>
                    ⚠️ {area.fault} 台故障
                  </Text>
                )}
                {area.warning > 0 && area.fault === 0 && (
                  <Text type="warning" style={{ fontSize: 12 }}>
                    ⚠️ {area.warning} 台预警
                  </Text>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <Space>
              <Input
                placeholder="搜索设备名称、编号、制造商..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 300 }}
              />
              <Button onClick={resetDeviceFilters}>清除筛选</Button>
            </Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openDeviceModal()}>
              添加设备
            </Button>
          </div>

          <Tabs activeKey={activeArea} onChange={setActiveArea} items={tabItems} style={{ marginBottom: 16 }} />

          <Table
            columns={columns}
            dataSource={filteredDevices}
            rowKey="id"
            scroll={{ x: 1600 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Space>
      </Card>

      <AdvancedFilter />

      <DeviceModal visible={isDeviceModalOpen} device={currentDevice} onClose={closeDeviceModal} />

      <Modal
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#1890ff' }} />
            <Title level={5} style={{ margin: 0 }}>
              设备详情
            </Title>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {detailDevice && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="基本信息">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="设备ID">{detailDevice.id}</Descriptions.Item>
                <Descriptions.Item label="设备名称">{detailDevice.name}</Descriptions.Item>
                <Descriptions.Item label="设备编号">{detailDevice.code}</Descriptions.Item>
                <Descriptions.Item label="设备类型">
                  {DEVICE_TYPE_MAP[detailDevice.type]}
                </Descriptions.Item>
                <Descriptions.Item label="所属区域">{detailDevice.areaName}</Descriptions.Item>
                <Descriptions.Item label="制造商">{detailDevice.manufacturer}</Descriptions.Item>
                <Descriptions.Item label="型号">{detailDevice.model}</Descriptions.Item>
                <Descriptions.Item label="安装时间">
                  {dayjs(detailDevice.installTime).format('YYYY-MM-DD')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="运行状态">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="设备状态">
                  <DeviceStatusTag status={detailDevice.status} />
                </Descriptions.Item>
                <Descriptions.Item label="监控状态">
                  <MonitorStatusTag status={detailDevice.monitorStatus} />
                </Descriptions.Item>
                <Descriptions.Item label="额定功率">{detailDevice.ratedPower} kW</Descriptions.Item>
                <Descriptions.Item label="当前功率">{detailDevice.currentPower} kW</Descriptions.Item>
                <Descriptions.Item label="负载率" span={2}>
                  <Space direction="vertical">
                    <LoadRateTag loadRate={detailDevice.loadRate} showProgress />
                    <LoadLevelBadge loadLevel={detailDevice.loadLevel} />
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="电压">{detailDevice.voltage} V</Descriptions.Item>
                <Descriptions.Item label="电流">{detailDevice.current} A</Descriptions.Item>
                <Descriptions.Item label="最后更新">
                  {dayjs(detailDevice.lastUpdateTime).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="功率因数">
                  {detailDevice.powerFactor ? `${(detailDevice.powerFactor * 100).toFixed(1)}%` : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="负载分析">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Card size="small">
                    <Progress
                      type="dashboard"
                      percent={Math.min(detailDevice.loadRate, 100)}
                      width={120}
                      strokeColor={
                        detailDevice.loadLevel === 'overload'
                          ? '#ff4d4f'
                          : detailDevice.loadLevel === 'high'
                          ? '#faad14'
                          : detailDevice.loadLevel === 'low'
                          ? '#52c41a'
                          : '#1890ff'
                      }
                      format={() => (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                            {detailDevice.loadRate.toFixed(1)}%
                          </div>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {LOAD_LEVEL_MAP[detailDevice.loadLevel].text}
                          </div>
                        </div>
                      )}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" title="负载状态说明">
                    <Space direction="vertical">
                      <Text>
                        <Tag color="success">低负载 (≤30%)</Tag> 设备运行在低负载状态
                      </Text>
                      <Text>
                        <Tag color="processing">正常 (30%-80%)</Tag> 设备运行在最佳负载区间
                      </Text>
                      <Text>
                        <Tag color="warning">高负载 (80%-100%)</Tag> 建议关注设备运行状态
                      </Text>
                      <Text>
                        <Tag color="error">过载 (>100%)</Tag> 设备过载运行，存在风险
                      </Text>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Space>
        )}
      </Modal>
    </Space>
  )
}

export default DeviceManagement
