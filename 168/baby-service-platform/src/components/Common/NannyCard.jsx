import React from 'react'
import { Card, Avatar, Tag, Rate, Button } from 'antd'
import { StarOutlined } from '@ant-design/icons'
import { formatPrice } from '@/utils'

const NannyCard = ({ nanny }) => {
  return (
    <Card className="card-shadow hover-scale" bodyStyle={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Avatar size={64} src={nanny.avatar} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{nanny.name}</div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
            {nanny.age}岁 · {nanny.experience}年经验
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Rate disabled value={nanny.rating} style={{ fontSize: 12 }} />
            <span style={{ color: '#ff6b9d', fontSize: 12 }}>{nanny.rating}</span>
            <span style={{ color: '#999', fontSize: 12 }}>({nanny.orderCount}单)</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {nanny.skills.map((skill, index) => (
          <Tag key={index} color="blue" style={{ margin: 0 }}>
            {skill}
          </Tag>
        ))}
      </div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.5 }}>
        {nanny.introduction}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="price-text" style={{ fontSize: 20, fontWeight: 700 }}>
            {formatPrice(nanny.price)}
          </span>
          <span style={{ color: '#999', fontSize: 12 }}> /月</span>
        </div>
        <Button type="primary">立即预约</Button>
      </div>
    </Card>
  )
}

export default React.memo(NannyCard)
