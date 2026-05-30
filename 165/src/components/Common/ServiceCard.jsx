import { Card, Rate, Tag } from 'antd'
import { EnvironmentOutlined, FireOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { memo } from 'react'

const ServiceCard = memo(({ service }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/service/${service.id}`)
  }

  return (
    <Card
      hoverable
      cover={
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            alt={service.name}
            src={service.image}
            style={{ height: 180, width: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          />
          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(255,77,79,0.9)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500
          }}>
            ¥{service.price}
          </div>
        </div>
      }
      className="service-card card-hover"
      onClick={handleClick}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <div style={{ marginBottom: 8 }}>
        <h3 style={{
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {service.name}
        </h3>
        <p style={{
          color: '#666',
          fontSize: 13,
          marginBottom: 12,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.5,
          minHeight: 39
        }}>
          {service.description}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Rate disabled value={service.rating} style={{ fontSize: 12 }} />
          <span style={{ color: '#faad14', fontSize: 12, fontWeight: 500 }}>{service.rating}</span>
        </div>
        <Tag icon={<FireOutlined />} color="orange" style={{ margin: 0 }}>
          {service.orderCount}单
        </Tag>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        color: '#999',
        fontSize: 12,
        marginTop: 10,
        paddingTop: 10,
        borderTop: '1px dashed #f0f0f0'
      }}>
        <EnvironmentOutlined style={{ marginRight: 4 }} />
        <span>距您 {service.distance}km</span>
        <span style={{ marginLeft: 'auto', color: '#1677ff', fontSize: 12 }}>
          {service.workerCount}位师傅
        </span>
      </div>
    </Card>
  )
})

ServiceCard.displayName = 'ServiceCard'

export default ServiceCard
