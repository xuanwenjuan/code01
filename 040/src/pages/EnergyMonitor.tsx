import React, { useMemo } from 'react'
import { Card, Row, Col, Tabs, List, Tag, Space, Typography, Statistic } from 'antd'
import { ThunderboltOutlined, WarningOutlined, CheckCircleOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { DailyEnergySummary, Alert, EnergyData, Device } from '@/types'
import { AREA_TYPE_MAP, AREA_COLORS, ALERT_LEVEL_COLORS } from '@/constants'
import { AlertTypeTag, AlertLevelTag, AlertStatusTag, DeviceStatusTag } from '@/components/StatusTags'
import AlertModal from '@/components/modals/AlertModal'
import { useDataStore } from '@/store/dataStore'
import dayjs from 'dayjs'

const { Text, Title } = Typography

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
  } = useDataStore()

  const activeAlerts = useMemo(
    () => alerts.filter(a => a.status === 'active').sort((a, b) => {
      const levelOrder = { high: 0, medium: 1, low: 2 }
      return levelOrder[a.level] - levelOrder[b.level]
    }),
    [alerts]
  )

  const topDevices = useMemo(() => {
    return [...devices]
      .filter(d => d.status === 'online')
      .sort((a, b) => b.currentPower - a.currentPower)
      .slice(0, 5)
  }, [devices])

  const areaEnergyTrend = useMemo(() => {
    const grouped: Record<string, { date: string; total: number }[]> = {}
    const sortedSummaries = [...dailyEnergySummaries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    sortedSummaries.forEach(summary => {
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
  const dates = areaEnergyTrend[areas[0]]?.map(item => item.date) || []

  const trendChartOption = {
    title: {
      text: '各区域能耗趋势',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 500 },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: { name: string; seriesName: string; value: number }[]) => {
        const lines = params.map(p => `${p.seriesName}: ${p.value.toFixed(2)} kWh`)
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
      data: dates.map(d => dayjs(d).format('MM-DD')),
    },
    yAxis: {
      type: 'value',
      name: 'kWh',
    },
    series: areas.map(areaId => ({
      name: AREA_TYPE_MAP[areaId.split('_')[1] as keyof typeof AREA_TYPE_MAP] || areaId,
      type: 'line' as const,
      smooth: true,
      data: areaEnergyTrend[areaId]?.map(item => item.total) || [],
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
    return dailyEnergySummaries.filter(s => s.date === today)
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
        data: todayByArea.map(s => ({
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
    return energyData.filter(d => new Date(d.timestamp).getTime() > oneHourAgo)
  }, [energyData])

  const averagePower = recentHourData.length > 0
    ? recentHourData.reduce((sum, d) => sum + d.power, 0) / recentHourData.length
    : 0

  const totalEnergy = recentHourData.reduce((sum, d) => sum + d.energyConsumption, 0)

  const tabItems = [
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
          高优先级 ({activeAlerts.filter(a => a.level === 'high').length})
        </span>
      ),
      filter: (a: Alert) => a.level === 'high',
    },
    {
      key: 'medium',
      label: (
        <span>
          <Tag color={ALERT_LEVEL_COLORS.medium}>中</Tag>
          中优先级 ({activeAlerts.filter(a => a.level === 'medium').length})
        </span>
      ),
      filter: (a: Alert) => a.level === 'medium',
    },
    {
      key: 'low',
      label: (
        <span>
          <Tag color={ALERT_LEVEL_COLORS.low}>低</Tag>
          低优先级 ({activeAlerts.filter(a => a.level === 'low').length})
        </span>
      ),
      filter: (a: Alert) => a.level === 'low',
    },
  ]

  const [activeTab, setActiveTab] = React.useState('all')

  const filteredAlerts = activeAlerts.filter(
    tabItems.find(t => t.key === activeTab)?.filter || (() => true)
  )

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: '100%' }}>
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
        <Col xs={24} sm={12} lg={6}>
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
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title={
                <Space>
                  <WarningOutlined style={{ color: '#ff4d4f' }} />
                  <span>活动告警</span>
                </Space>
              }
              value={activeAlerts.length}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>在线设备</span>
                </Space>
              }
              value={devices.filter(d => d.status === 'online').length}
              suffix={`/ ${devices.length}`}
              valueStyle={{ color: '#52c41a' }}
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
                    <Tag key="power" color={device.currentPower > device.ratedPower * 0.9 ? 'red' : 'blue'}>
                      {device.currentPower} kW / {device.ratedPower} kW
                    </Tag>,
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
                        <Text type="secondary">电压: {device.voltage}V</Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">电流: {device.current}A</Text>
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
                      <Tag color="blue" onClick={() => openAlertModal(alert)} style={{ cursor: 'pointer' }}>
                        查看详情
                      </Tag>
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
        device={currentAlert ? devices.find(d => d.id === currentAlert.deviceId) : undefined}
        onClose={closeAlertModal}
      />
    </Space>
  )
}

export default EnergyMonitor
