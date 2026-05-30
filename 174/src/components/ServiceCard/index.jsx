import React from 'react'
import { Card, Tag, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import * as Icons from '@ant-design/icons'
import './index.css'

const ServiceCard = ({ service }) => {
  const navigate = useNavigate()
  const IconComponent = Icons[service.icon]

  const handleClick = () => {
    navigate(`/service/${service.id}`)
  }

  return (
    <Card className="service-card card-hover" onClick={handleClick} cover={
      <div className="service-cover">
        <img src={service.image} alt={service.name} />
      </div>
    }>
      <Card.Meta
        title={
          <div className="service-title">
            <span className="icon-wrapper">
              {IconComponent && <IconComponent />}
            </span>
            <span>{service.name}</span>
          </div>
        }
        description={
          <div className="service-desc">
            <p className="desc-text">{service.description}</p>
            <div className="service-tags">
              {service.tags.map((tag, index) => (
                <Tag key={index} color="blue">{tag}</Tag>
              ))}
            </div>
            <div className="service-footer">
              <div className="price-info">
                <span className="current-price">¥{service.price}</span>
                <span className="original-price">¥{service.originalPrice}</span>
              </div>
              <Button type="primary" size="small" onClick={(e) => {
                e.stopPropagation()
                navigate(`/service/${service.id}`)
              }}>
                立即预约
              </Button>
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default ServiceCard
