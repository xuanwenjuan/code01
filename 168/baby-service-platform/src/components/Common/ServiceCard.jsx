import React from 'react'
import { Card, Tag, Rate, Button } from 'antd'
import { HeartOutlined, HeartFilled, EnvironmentOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useFavorite } from '@/hooks/useFavorite'
import { formatPrice } from '@/utils'

const { Meta } = Card

const ServiceCard = ({ service }) => {
  const navigate = useNavigate()
  const { isFavorite, handleToggleFavorite } = useFavorite()
  const favorited = isFavorite(service.id)

  const handleClick = () => {
    navigate(`/service/${service.id}`)
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    handleToggleFavorite(service.id)
  }

  return (
    <Card
      hoverable
      className="card-shadow hover-scale"
      cover={
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          <img
            alt={service.name}
            src={service.image}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Button
            type="text"
            icon={favorited ? <HeartFilled style={{ color: '#ff6b9d' }} /> : <HeartOutlined />}
            onClick={handleFavoriteClick}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          {service.originalPrice > service.price && (
            <Tag
              color="#ff6b9d"
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                margin: 0
              }}
            >
              限时特惠
            </Tag>
          )}
        </div>
      }
      onClick={handleClick}
      styles={{ body: { padding: 16 } }}
    >
      <Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="text-ellipsis" style={{ flex: 1, marginRight: 8, fontSize: 16, fontWeight: 600 }}>
              {service.name}
            </span>
          </div>
        }
        description={
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Rate disabled value={service.rating} style={{ fontSize: 12 }} />
              <span style={{ color: '#ff6b9d', fontSize: 12 }}>{service.rating}</span>
              <span style={{ color: '#999', fontSize: 12 }}>({service.reviewCount}条评价)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#999' }}>
              <EnvironmentOutlined />
              <span>{service.distance}km</span>
              <span>·</span>
              <span>已售{service.sales}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {service.features?.slice(0, 3).map((feature, index) => (
                <Tag key={index} color="pink" style={{ fontSize: 11, margin: 0 }}>
                  {feature}
                </Tag>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="price-text" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatPrice(service.price)}
              </span>
              {service.originalPrice > service.price && (
                <span style={{ color: '#999', textDecoration: 'line-through', fontSize: 12 }}>
                  {formatPrice(service.originalPrice)}
                </span>
              )}
              <span style={{ color: '#999', fontSize: 12, marginLeft: 'auto' }}>
                起
              </span>
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default React.memo(ServiceCard)
