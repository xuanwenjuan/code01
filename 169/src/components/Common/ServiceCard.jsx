import React from 'react'
import { Card, Rate, Tag, Button } from 'antd'
import { EnvironmentOutlined, StarOutlined, ShoppingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useFavorite } from '@/hooks/useFavorite'

const { Meta } = Card

const ServiceCard = ({ service }) => {
  const navigate = useNavigate()
  const { isFavorite, handleToggleFavorite } = useFavorite()
  const favorited = isFavorite(service.id)

  const handleClick = () => {
    navigate(`/service/${service.id}`)
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    handleToggleFavorite(service)
  }

  return (
    <Card
      className="service-card"
      hoverable
      cover={
        <div className="service-card-cover" style={{ backgroundColor: service.color }}>
          <span className="service-card-cover-text">{service.name}</span>
        </div>
      }
      onClick={handleClick}
      actions={[
        <span key="rating">
          <Rate disabled value={service.rating} allowHalf className="card-rate" />
          <span className="rating-text">{service.rating}</span>
        </span>,
        <span key="sales">
          <ShoppingOutlined /> {service.sales} 人购买
        </span>,
        <span key="favorite" onClick={handleFavorite}>
          <StarOutlined className={favorited ? 'favorited' : ''} /> 收藏
        </span>
      ]}
    >
      <div className="service-card-content">
        <Meta title={<span className="service-title">{service.name}</span>} />
        <div className="service-card-tags">
          {service.features?.slice(0, 2).map((tag, index) => (
            <Tag key={index} color="blue" size="small">
              {tag}
            </Tag>
          ))}
        </div>
        <div className="service-card-footer">
          <div className="shop-info">
            <span className="shop-name">{service.shopName}</span>
            <span className="distance">
              <EnvironmentOutlined /> {service.distance}km
            </span>
          </div>
          <div className="price-info">
            <span className="current-price">¥{service.price}</span>
            <span className="original-price">¥{service.originalPrice}</span>
          </div>
        </div>
        <Button type="primary" block className="book-btn">
          立即预约
        </Button>
      </div>
    </Card>
  )
}

export default React.memo(ServiceCard)
