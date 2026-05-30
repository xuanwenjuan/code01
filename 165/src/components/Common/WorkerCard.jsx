import { Card, Avatar, Rate, Tag } from 'antd'
import { StarOutlined, TrophyOutlined } from '@ant-design/icons'
import { memo } from 'react'

const WorkerCard = memo(({ worker }) => {
  return (
    <Card className="card-hover">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Avatar size={64} src={worker.avatar} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{worker.name}</span>
            <Tag icon={<TrophyOutlined />} color="gold" style={{ margin: 0 }}>
              {worker.experience}年经验
            </Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Rate disabled value={worker.rating} style={{ fontSize: 12 }} />
            <span style={{ color: '#666', fontSize: 12 }}>
              <StarOutlined style={{ color: '#faad14', marginRight: 2 }} />
              {worker.rating} · {worker.orderCount}单
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {worker.skills.slice(0, 3).map(skill => (
              <Tag key={skill} style={{ margin: 0 }}>{skill}</Tag>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
})

WorkerCard.displayName = 'WorkerCard'

export default WorkerCard
