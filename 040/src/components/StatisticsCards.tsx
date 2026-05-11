import React from 'react'
import { Row, Col, Card, Statistic, Tooltip, Tag } from 'antd'
import {
  ThunderboltOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  SettingOutlined,
  RiseOutlined,
  BulbOutlined,
  FireOutlined,
} from '@ant-design/icons'
import type { Statistics } from '@/types'

interface StatisticsCardsProps {
  statistics: Statistics
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
  const isHighLoad = statistics.avgLoadRate >= 80

  const cards = [
    {
      title: '设备总数',
      value: statistics.totalDevices,
      icon: <AppstoreOutlined style={{ color: '#1890ff', fontSize: 24 }} />,
      suffix: '台',
      color: '#1890ff',
      span: 3,
    },
    {
      title: '在线设备',
      value: statistics.onlineDevices,
      icon: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
      suffix: '台',
      color: '#52c41a',
      span: 3,
    },
    {
      title: '离线设备',
      value: statistics.offlineDevices,
      icon: <CloseCircleOutlined style={{ color: '#8c8c8c', fontSize: 24 }} />,
      suffix: '台',
      color: '#8c8c8c',
      span: 3,
    },
    {
      title: '故障设备',
      value: statistics.faultDevices,
      icon: <WarningOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />,
      suffix: '台',
      color: '#ff4d4f',
      span: 3,
    },
    {
      title: '维护中',
      value: statistics.maintenanceDevices,
      icon: <SettingOutlined style={{ color: '#faad14', fontSize: 24 }} />,
      suffix: '台',
      color: '#faad14',
      span: 3,
    },
    {
      title: (
        <Tooltip title="在线设备的平均负载率">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BulbOutlined style={{ color: isHighLoad ? '#faad14' : '#722ed1', fontSize: 24 }} />
            平均负载率
            {isHighLoad && <Tag color="orange" style={{ marginLeft: 4 }}>⚠ 偏高</Tag>}
          </span>
        </Tooltip>
      ),
      value: statistics.avgLoadRate,
      icon: <BulbOutlined style={{ color: isHighLoad ? '#faad14' : '#722ed1', fontSize: 24 }} />,
      suffix: '%',
      color: isHighLoad ? '#faad14' : '#722ed1',
      precision: 1,
      span: 3,
    },
    {
      title: (
        <Tooltip title="负载率≥80%的设备数量">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FireOutlined style={{ color: statistics.highLoadDevices > 0 ? '#ff4d4f' : '#13c2c2', fontSize: 24 }} />
            高负载设备
            {statistics.highLoadDevices > 0 && <Tag color="red" style={{ marginLeft: 4 }}>
              {statistics.highLoadDevices} 台
            </Tag>}
          </span>
        </Tooltip>
      ),
      value: statistics.highLoadDevices,
      icon: <FireOutlined style={{ color: statistics.highLoadDevices > 0 ? '#ff4d4f' : '#13c2c2', fontSize: 24 }} />,
      suffix: '台',
      color: statistics.highLoadDevices > 0 ? '#ff4d4f' : '#13c2c2',
      span: 3,
    },
    {
      title: '今日能耗',
      value: statistics.todayEnergy,
      icon: <ThunderboltOutlined style={{ color: '#1890ff', fontSize: 24 }} />,
      suffix: 'kWh',
      color: '#1890ff',
      precision: 2,
      span: 3,
    },
    {
      title: '今日峰值',
      value: statistics.todayPeakEnergy,
      icon: <RiseOutlined style={{ color: '#722ed1', fontSize: 24 }} />,
      suffix: 'kWh',
      color: '#722ed1',
      precision: 2,
      span: 3,
    },
    {
      title: '今日谷值',
      value: statistics.todayValleyEnergy,
      icon: <RiseOutlined style={{ color: '#13c2c2', fontSize: 24 }} />,
      suffix: 'kWh',
      color: '#13c2c2',
      precision: 2,
      span: 3,
    },
    {
      title: '活动告警',
      value: statistics.activeAlerts,
      icon: <WarningOutlined style={{ color: statistics.activeAlerts > 0 ? '#ff4d4f' : '#52c41a', fontSize: 24 }} />,
      suffix: '条',
      color: statistics.activeAlerts > 0 ? '#ff4d4f' : '#52c41a',
      span: 3,
    },
    {
      title: '高优先级告警',
      value: statistics.highPriorityAlerts,
      icon: <WarningOutlined style={{ color: statistics.highPriorityAlerts > 0 ? '#ff4d4f' : '#8c8c8c', fontSize: 24 }} />,
      suffix: '条',
      color: statistics.highPriorityAlerts > 0 ? '#ff4d4f' : '#8c8c8c',
      span: 3,
    },
  ]

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card, index) => (
        <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4} span={card.span}>
          <Card style={{ borderLeft: `4px solid ${card.color}`, height: '100%' }}>
            <Statistic
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {card.icon}
                  {typeof card.title === 'string' ? card.title : card.title}
                </span>
              }
              value={card.value}
              suffix={card.suffix}
              precision={card.precision}
              valueStyle={{ color: card.color }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  )
}
