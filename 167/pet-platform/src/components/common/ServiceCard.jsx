import React from 'react'
import { Card, Tag, Rate, Button } from 'antd'
import { HeartOutlined, HeartFilled, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useFavorite } from '@/hooks/useFavorite'
import { formatPrice, formatDistance, formatDuration } from '@/utils'

const ServiceCard = ({ service, showFavorite = true }) => {
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorite()

  const handleClick = () => {
    navigate(`/service/${service.id}`)
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    toggleFavorite(service.id)
  }

  return (
    <Card
      hoverable
      className="card-hover"
      onClick={handleClick}
      cover={
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          <img
            src={service.image}
            alt={service.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {showFavorite && (
            <Button
              type="text"
              icon={isFavorite(service.id) ? <HeartFilled style={{ color: '#ff4d4f', fontSize: '20px' }} /> : <HeartOutlined style={{ color: '#fff', fontSize: '20px' }} />}
              onClick={handleFavorite}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '50%',
                width: 36,
                height: 36,
              }}
            />
          )}
          {service.tags && service.tags.length > 0 && (
            <div style={{ position: 'absolute', top: 8, left: 8 }}>
              {service.tags.slice(0, 2).map((tag, index) => (
                <Tag key={index} color="orange" style={{ marginRight: 4 }}>
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </div>
      }
      styles={{ body: { padding: 16 } }}
    >
      <div className="text-ellipsis" style={{ fontSize: '16px', fontWeight: '600', marginBottom: 8 }}>
        {service.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Rate disabled value={service.rating} allowHalf style={{ fontSize: '12px' }} />
        <span style={{ color: '#fa8c16', fontSize: '14px' }}>{service.rating}</span>
        <span style={{ color: '#999', fontSize: '12px' }}>({service.reviewCount}评价)</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#999', fontSize: '12px', marginBottom: 12 }}>
        <span><EnvironmentOutlined /> {formatDistance(service.distance)}</span>
        <span><ClockCircleOutlined /> {formatDuration(service.duration)}</span>
      </div>
      <div className="flex-between">
        <div>
          <span style={{ color: '#ff6b35', fontSize: '22px', fontWeight: 'bold' }}>{formatPrice(service.price)}</span>
          {service.originalPrice > service.price && (
            <span style={{ color: '#999', textDecoration: 'line-through', marginLeft: 8, fontSize: '13px' }}>
              {formatPrice(service.originalPrice)}
            </span>
          )}
        </div>
        <span style={{ color: '#999', fontSize: '12px' }}>已售{service.sales}</span>
      </div>
    </Card>
  )
}

export default ServiceCard
