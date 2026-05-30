import { Card, Avatar, Rate, Space } from 'antd'
import { UserOutlined } from '@ant-design/icons'

function ReviewCard({ review }) {
  return (
    <Card size="small" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userId}`} size={40} icon={<UserOutlined />} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 500 }}>{review.userName}</span>
            <span style={{ color: '#999', fontSize: 12 }}>{review.time}</span>
          </div>
          <Rate disabled defaultValue={review.rating} style={{ fontSize: 12, marginBottom: 8 }} />
          <p style={{ color: '#666', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            {review.content}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default ReviewCard
