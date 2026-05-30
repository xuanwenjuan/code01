import { Card, Tag, Rate, Space } from 'antd'
import { EyeOutlined, StarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

function ServiceCard({ service }) {
  const navigate = useNavigate()

  return (
    <Card
      hoverable
      className="card-hover"
      cover={
        <div style={{ height: 180, overflow: 'hidden' }}>
          <img
            alt={service.name}
            src={service.image}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      }
      onClick={() => navigate(`/service/${service.id}`)}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ marginBottom: 8 }}>
        <Tag color="blue">{service.category}</Tag>
      </div>
      <Card.Meta
        title={
          <Space>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{service.name}</span>
            <Rate disabled defaultValue={service.rating} style={{ fontSize: 12 }} />
          </Space>
        }
        description={
          <div style={{ marginTop: 8 }}>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>
              {service.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#ff4d4f', fontSize: 20, fontWeight: 700 }}>
                  ¥{service.price}
                </span>
                <span style={{ color: '#999', fontSize: 12 }}>/{service.unit}</span>
              </div>
              <Space style={{ color: '#999', fontSize: 12 }}>
                <StarOutlined /> {service.rating}
                <EyeOutlined /> {service.sales}人购买
              </Space>
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default ServiceCard
