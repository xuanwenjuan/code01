import { Card, Avatar, Rate, Tag, Space, Button } from 'antd'
import { StarOutlined, UserOutlined } from '@ant-design/icons'

function CleanerCard({ cleaner, onBook }) {
  return (
    <Card className="card-hover" bodyStyle={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <Avatar src={cleaner.avatar} size={64} icon={<UserOutlined />} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{cleaner.name}</span>
            <Space>
              <Rate disabled defaultValue={cleaner.rating} style={{ fontSize: 12 }} />
              <span style={{ color: '#faad14', fontWeight: 600 }}>{cleaner.rating}</span>
            </Space>
          </div>
          <div style={{ marginBottom: 8 }}>
            <Space size={[4, 4]} wrap>
              {cleaner.skills.map((skill, index) => (
                <Tag key={index} color="green" style={{ margin: 0 }}>
                  {skill}
                </Tag>
              ))}
            </Space>
          </div>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
            {cleaner.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#999', fontSize: 12 }}>
              <StarOutlined /> 已服务 {cleaner.orderCount} 单
            </span>
            {onBook && (
              <Button type="primary" size="small" onClick={() => onBook(cleaner)}>
                预约
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CleanerCard
