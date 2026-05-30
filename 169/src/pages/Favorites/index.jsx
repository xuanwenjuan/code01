import React from 'react'
import { Card, Row, Col, Button } from 'antd'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ServiceCard from '@/components/Common/ServiceCard'
import EmptyState from '@/components/Common/EmptyState'

const Favorites = () => {
  const navigate = useNavigate()
  const { favorites } = useSelector((state) => state.user)

  return (
    <div className="favorites-page">
      <div className="section-container">
        <div className="page-header">
          <h1 className="page-title">我的收藏</h1>
          <span className="count-badge">共 {favorites.length} 个收藏</span>
        </div>

        {favorites.length > 0 ? (
          <Row gutter={[16, 16]}>
            {favorites.map((service) => (
              <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
                <ServiceCard service={service} />
              </Col>
            ))}
          </Row>
        ) : (
          <EmptyState
            description="暂无收藏的服务"
            actionText="去浏览服务"
            onAction={() => navigate('/services')}
          />
        )}
      </div>
    </div>
  )
}

export default Favorites
