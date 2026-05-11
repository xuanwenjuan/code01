import React, { useMemo, useState, useCallback } from 'react'
import {
  Card,
  Row,
  Col,
  Tabs,
  List,
  Tag,
  Space,
  Typography,
  Statistic,
  Button,
  message,
  Badge,
} from 'antd'
import {
  ThunderboltOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  PoweroffOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { DailyEnergySummary, Alert, EnergyData, Device, AlertLevel, AlertStatus } from '@/types'
import { AREA_TYPE_MAP, AREA_COLORS, ALERT_LEVEL_COLORS } from '@/constants'
import { AlertTypeTag, AlertLevelTag, AlertStatusTag, DeviceStatusTag, LoadRateTag } from '@/components/StatusTags'
import AlertModal from '@/components/modals/AlertModal'
import { useDataStore } from '@/store/dataStore'
import dayjs from 'dayjs'

const { Text, Title } = Typography

interface AlertTabItem {
  key: string
  label: React.ReactNode
  filter: (alert: Alert) => boolean
}

interface TrendChartTooltipParam {
  name: string
  seriesName: string
  value: number
}

const EnergyMonitor: React.FC = () => {
  const {
    dailyEnergySummaries,
    energyData,
    alerts,
    devices,
    currentAlert,
    isAlertModalOpen,
    openAlertModal,
    closeAlertModal,
    toggleDeviceStatus,
    resolveAlert,
    acknowledgeAlert,
    updateStatistics,
  } = useDataStore()

  const [activeTab, setActiveTab] = useState<string>('all')
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const activeAlerts = useMemo(
    () =>
      alerts
        .filter((a: Alert) => a.status === 'active')
        .sort((a: Alert, b: Alert) => {
          const levelOrder: Record<AlertLevel, number> = { high: 0, medium: 1, low: 2 }
          return levelOrder[a.level] - levelOrder[b.level]
        }),
    [alerts]
  )

  const topDevices = useMemo(() => {
    return [...devices]
      .filter((d: Device) => d.status === 'online')
      .sort((a: Device, b: Device) => b.currentPower - a.currentPower)
      .slice(0, 5)
  }, [devices])

  const areaEnergyTrend = useMemo(() => {
    const grouped: Record<string, { date: string; total: number }[]> = {}
    const sortedSummaries = [...dailyEnergySummaries].sort(
      (a: DailyEnergySummary, b: DailyEnergySummary) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    sortedSummaries.forEach((summary: DailyEnergySummary) => {
      if (!grouped[summary.areaId]) {
        grouped[summary.areaId] = []
      }
      grouped[summary.areaId].push({
        date: summary.date,
        total: summary.totalEnergy,
      })
    })

    return grouped
  }, [dailyEnergySummaries])

  const areas = Object.keys(areaEnergyTrend)
  const dates = areaEnergyTrend[areas[0]]?.map((item) => item.date) || []

  const trendChartOption = {
    title: {
      text: '各区域能耗趋势',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 500 },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: TrendChartTooltipParam[]) => {
        const lines = params.map((p) => `${p.seriesName}: ${p.value.toFixed(2)} kWh`)
        return `${params[0]?.name}<br/>${lines.join('<br/>')}`
      },
    },
    legend: {
      data: Object.values(AREA_TYPE_MAP),
      bottom: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates.map((d) => dayjs(d).format('MM-DD')),
    },
    yAxis: {
      type: 'value',
      name: 'kWh',
    },
    series: areas.map((areaId) => ({
      name: AREA_TYPE_MAP[areaId.split('_')[1] as keyof typeof AREA_TYPE_MAP] || areaId,
      type: 'line' as const,
      smooth: true,
      data: areaEnergyTrend[areaId]?.map((item) => item.total) || [],
      lineStyle: {
        width: 2,
      },
      areaStyle: {
        opacity: 0.1,
      },
    })),
  }

  const todayByArea = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return dailyEnergySummaries.filter((s: DailyEnergySummary) => s.date === today)
  }, [dailyEnergySummaries])

  const pieChartOption = {
    title: {
      text: '今日能耗分布',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 500 },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} kWh ({d}%)',
    },
    legend: {
      orient: 'vertical' as const,
      right: 10,
      top: 'center',
    },
    series: [
      {
        name: '能耗分布',
        type: 'pie' as const,
        radius: ['40%', '70%'],
        center: ['40%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center' as const,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: todayByArea.map((s: DailyEnergySummary) => ({
          value: s.totalEnergy,
          name: s.areaName,
          itemStyle: { color: AREA_COLORS[s.areaId.split('_')[1]] || '#1890ff' },
        })),
      },
    ],
  }

  const recentHourData = useMemo(() => {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    return energyData.filter((d: EnergyData) => new Date(d.timestamp).getTime() > oneHourAgo)
  }, [energyData])

  const averagePower =
    recentHourData.length > 0
      ? recentHourData.reduce((sum: number, d: EnergyData) => sum + d.power, 0) / recentHourData.length
      : 0

  const totalEnergy = recentHourData.reduce(
    (sum: number, d: EnergyData) => sum + d.energyConsumption,
    0
  )

  const tabItems: AlertTabItem[] = [
    {
      key: 'all',
      label: <span>全部告警 ({activeAlerts.length})</span>,
      filter: () => true,
    },
    {
      key: 'high',
      label: (
        <span>
          <Tag color={ALERT_LEVEL_COLORS.high}>高</Tag>
          高优先级 ({activeAlerts.filter((a: Alert) => a.level === 'high').length})
        </span>
      ),
      filter: (a: Alert) => a.level === 'high',
    },
    {
      key: 'medium',
      label: (
        <span>
          <Tag color={ALERT_LEVEL_COLORS.medium}>中</Tag>
          中优先级 ({activeAlerts.filter((a: Alert) => a.level === 'medium').length})
        </span>
      ),
      filter: (a: Alert) => a.level === 'medium',
    },
    {
      key: 'low',
      label: (
        <span>
          <Tag color={ALERT_LEVEL_COLORS.low}>低</Tag>
          低优先级 ({activeAlerts.filter((a: Alert) => a.level === 'low').length})
        </span>
      ),
      filter: (a: Alert) => a.level === 'low',
    },
  ]

  const filteredAlerts = activeAlerts.filter(
    tabItems.find((t) => t.key === activeTab)?.filter || (() => true)
  )

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    updateStatistics()
    setTimeout(() => {
      setRefreshing(false)
      message.success('数据已刷新')
    }, 500)
  }, [updateStatistics])

  const handleToggleDeviceStatus = useCallback(
    (device: Device) => {
      toggleDeviceStatus(device.id, '系统管理员')
      const action = device.status === 'offline' ? '上线' : '下线'
      message.success(`${device.name} 已${action}`)
    },
    [toggleDeviceStatus]
  )

  const handleAcknowledgeAlert = useCallback(
    (alert: Alert) => {
      acknowledgeAlert(alert.id, '系统管理员')
      message.success('告警已确认，工单已派发')
    },
    [acknowledgeAlert]
  )

  const handleResolveAlert = useCallback(
    (alert: Alert) => {
      resolveAlert(alert.id, '系统管理员', '问题已修复')
      message.success('告警已解决')
    },
    [resolveAlert]
  )

  const alertsByStatus = useMemo(() => {
    const statusCounts: Record<AlertStatus, number> = {
      active: 0,
      acknowledged: 0,
      resolved: 0,
    }
    alerts.forEach((a: Alert) => {
      statusCounts[a.status]++
    })
    return statusCounts
  }, [alerts])

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card
            style={{ height: '100%' }}
            extra={
              <Button
                type="text"
                icon={<ReloadOutlined spin={refreshing} />}
                onClick={handleRefresh}
              />
            }
          >
            <Statistic
              title={
                <Space>
                  <ThunderboltOutlined style={{ color: '#1890ff' }} />
                  <span>近1小时平均功率</span>
                </Space>
              }
              value={averagePower}
              suffix="kW"
              precision={1}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title={
                <Space>
                  <RiseOutlined style={{ color: '#722ed1' }} />
                  <span>近1小时总能耗</span>
                </Space>
              }
              value={totalEnergy}
              suffix="kWh"
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title={
                <Space>
                  <WarningOutlined style={{ color: '#ff4d4f' }} />
                  <span>活动告警</span>
                </Space>
              }
              value={alertsByStatus.active}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Space size={[12, 8]} wrap>
                <Badge color="orange" text={`已确认: ${alertsByStatus.acknowledged}`} />
                <Badge color="green" text={`已解决: ${alertsByStatus.resolved}`} />
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>在线设备</span>
                </Space>
              }
              value={devices.filter((d: Device) => d.status === 'online').length}
              suffix={`/ ${devices.length}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title={
                <Space>
                  <PoweroffOutlined style={{ color: '#8c8c8c' }} />
                  <span>离线设备</span>
                </Space>
              }
              value={devices.filter((d: Device) => d.status === 'offline').length}
              suffix={`/ ${devices.length}`}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title={
                <Space>
                  <WarningOutlined style={{ color: '#faad14' }} />
                  <span>故障设备</span>
                </Space>
              }
              value={devices.filter((d: Device) => d.status === 'fault').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <ReactECharts
              option={trendChartOption}
              style={{ height: 350 }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <ReactECharts
              option={pieChartOption}
              style={{ height: 350 }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={<Title level={5}>高能耗设备 TOP 5</Title>}>
            <List
              dataSource={topDevices}
              renderItem={(device: Device, index: number) => (
                <List.Item
                  actions={[
                    <DeviceStatusTag key="status" status={device.status} />,
                    <LoadRateTag
                      key="load"
                      loadRate={
                        device.ratedPower > 0
                          ? Math.round((device.currentPower / device.ratedPower) * 10000) / 100
                          : 0
                      }
                      showProgress
                    />,
                    <Button
                      key="toggle"
                      type="link"
                      size="small"
                      icon={<PoweroffOutlined />}
                      onClick={() => handleToggleDeviceStatus(device)}
                      danger={device.status === 'online'}
                    >
                      {device.status === 'online' ? '下线' : '上线'}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${index < 3 ? '#ff4d4f' : '#1890ff'}, ${index < 3 ? '#ff7875' : '#69c0ff'})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: 14,
                        }}
                      >
                        {index + 1}
                      </div>
                    }
                    title={device.name}
                    description={
                      <Space>
                        <Text type="secondary">{device.areaName}</Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">功率: {device.currentPower}kW / {device.ratedPower}kW</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                <Title level={5} style={{ margin: 0 }}>
                  活动告警
                </Title>
              </Space>
            }
            extra={<Tag color="red">{activeAlerts.length} 条未处理</Tag>}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="small"
            />
            <List
              dataSource={filteredAlerts}
              locale={{ emptyText: '暂无活动告警' }}
              renderItem={(alert: Alert) => (
                <List.Item
                  style={{
                    borderLeft: `4px solid ${ALERT_LEVEL_COLORS[alert.level]}`,
                    paddingLeft: 12,
                    marginBottom: 8,
                    background: '#fafafa',
                    borderRadius: 4,
                  }}
                  actions={[
                    <AlertTypeTag key="type" type={alert.type} />,
                    <AlertLevelTag key="level" level={alert.level} />,
                    <AlertStatusTag key="status" status={alert.status} />,
                  ]}
                  extra={
                    <Space direction="vertical" align="end">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(alert.createTime).format('MM-DD HH:mm')}
                      </Text>
                      <Space>
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => handleAcknowledgeAlert(alert)}
                        >
                          确认
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleResolveAlert(alert)}
                        >
                          解决
                        </Button>
                        <Tag color="blue" onClick={() => openAlertModal(alert)} style={{ cursor: 'pointer' }}>
                          详情
                        </Tag>
                      </Space>
                    </Space>
                  }
                >
                  <List.Item.Meta
                    avatar={<WarningOutlined style={{ color: ALERT_LEVEL_COLORS[alert.level], fontSize: 20 }} />}
                    title={
                      <Space>
                        <Text strong>{alert.deviceName}</Text>
                        <Text type="secondary">({alert.areaName})</Text>
                      </Space>
                    }
                    description={alert.message}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <AlertModal
        visible={isAlertModalOpen}
        alert={currentAlert}
        device={currentAlert ? devices.find((d: Device) => d.id === currentAlert.deviceId) : undefined}
        onClose={closeAlertModal}
      />
    </Space>
  )
}

export default EnergyMonitor
