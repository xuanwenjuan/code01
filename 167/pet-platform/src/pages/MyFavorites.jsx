import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Row, Col, Empty } from 'antd'
import ServiceCard from '@/components/common/ServiceCard'
import PageState from '@/components/common/PageState'

const MyFavorites = () => {
  const { services, favorites } = useSelector((state) => state.service)

  const favoriteServices = useMemo(() => {
    return services.filter((s) => favorites.includes(s.id))
  }, [services, favorites])

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 24 }}>我的收藏</h2>
        <PageState data={favoriteServices} emptyText="暂无收藏的服务">
          <Row gutter={[16, 16]}>
            {favoriteServices.map((service) => (
              <Col xs={24} sm={12} lg={6} key={service.id}>
                <ServiceCard service={service} showFavorite={false} />
              </Col>
            ))}
          </Row>
        </PageState>
      </div>
    </div>
  )
}

export default MyFavorites
