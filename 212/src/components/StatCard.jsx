import React from 'react'
import { Card, Statistic } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

const StatCard = ({
  title,
  value,
  prefix,
  suffix,
  precision = 0,
  valueStyle,
  trend,
  trendValue,
  icon,
  color = '#1890ff'
}) => {
  return (
    <Card className="stat-card" bordered={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: 0, color: '#666', fontSize: 14, marginBottom: 8 }}>
            {title}
          </p>
          <Statistic
            value={value}
            precision={precision}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ color, fontSize: 28, fontWeight: 600, ...valueStyle }}
          />
          {trend && (
            <span style={{
              fontSize: 12,
              color: trend === 'up' ? '#52c41a' : '#ff4d4f',
              marginTop: 8,
              display: 'inline-block'
            }}>
              {trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {' '}{trendValue} 较昨日
            </span>
          )}
        </div>
        {icon && (
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color
          }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

export default StatCard
