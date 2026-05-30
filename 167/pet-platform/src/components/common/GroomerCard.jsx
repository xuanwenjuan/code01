import React from 'react'
import { Card, Rate, Button, Tag } from 'antd'
import { StarOutlined, TrophyOutlined } from '@ant-design/icons'

const GroomerCard = ({ groomer }) => {
  return (
    <Card className="card-hover" style={{ height: '100%' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <img
          src={groomer.avatar}
          alt={groomer.name}
          style={{ width: 64, height: 64, borderRadius: '50%' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '16px', fontWeight: '600' }}>{groomer.name}</span>
            <Tag color="blue" style={{ margin: 0 }}>{groomer.title}</Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '13px', color: '#666', marginBottom: 8 }}>
            <span><TrophyOutlined /> {groomer.experience}年经验</span>
            <span><StarOutlined /> {groomer.rating}分</span>
            <span>服务{groomer.orderCount}单</span>
          </div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: 12 }} className="text-ellipsis">
            {groomer.description}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {groomer.specialty.map((item, index) => (
              <Tag key={index} style={{ margin: 0 }}>{item}</Tag>
            ))}
          </div>
          <div className="flex-between">
            <span style={{ color: '#ff6b35', fontSize: '18px', fontWeight: 'bold' }}>¥{groomer.price}起</span>
            <Button type="primary" size="small">预约</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default GroomerCard
