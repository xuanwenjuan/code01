import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button } from 'antd'
import ServiceCard from '@/components/Common/ServiceCard'
import EmptyState from '@/components/Common/EmptyState'
import { useFavorite } from '@/hooks/useFavorite'

const Favorites = () => {
  const navigate = useNavigate()
  const { favoriteServices, handleClearFavorites } = useFavorite()

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>我的收藏</h1>
          <p>查看您收藏的服务</p>
        </div>
      </div>

      <div className="container page-content">
        <Card className="card-shadow">
          {favoriteServices.length > 0 ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ color: '#666' }}>共收藏 {favoriteServices.length} 个服务</span>
                <Button danger onClick={handleClearFavorites}>
                  清空收藏
                </Button>
              </div>
              <Row gutter={[16, 16]}>
                {favoriteServices.map(service => (
                  <Col xs={24} sm={12} md={6} key={service.id}>
                    <ServiceCard service={service} />
                  </Col>
                ))}
              </Row>
            </>
          ) : (
            <EmptyState
              description="还没有收藏任何服务"
              actionText="去逛逛"
              onAction={() => navigate('/services')}
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default Favorites
