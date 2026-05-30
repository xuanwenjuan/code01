import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Carousel, Row, Col, Empty, Spin, Tag, Space, Result, Button, Typography } from 'antd'
import { StarOutlined, FireOutlined } from '@ant-design/icons'
import ServiceCard from '@/components/ServiceCard'
import CleanerCard from '@/components/CleanerCard'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

function Home() {
  const navigate = useNavigate()
  const { banners, services, cleaners, currentCity, loading } = useSelector((state) => state.service)

  const topCleaners = useMemo(() => {
    if (!cleaners || cleaners.length === 0) return []
    return [...cleaners].sort((a, b) => b.rating - a.rating).slice(0, 4)
  }, [cleaners])

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <Spin size="large" tip="正在加载首页数据..." />
        </div>
      </div>
    )
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="page-container">
        <Result
          status="warning"
          title="数据加载中"
          subTitle="首页数据正在初始化，请稍候..."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Carousel autoplay dotsStyle={{ bottom: 10 }} effect="fade">
          {banners.map((banner) => (
            <div key={banner.id}>
              <div
                style={{
                  height: 360,
                  background: `linear-gradient(135deg, #1890ff 0%, #096dd9 100%)`,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.4,
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff' }}>
                  <Title level={2} style={{ color: '#fff', margin: '0 0 8px 0', fontSize: 36, fontWeight: 700 }}>
                    {banner.title}
                  </Title>
                  <Text style={{ color: '#fff', fontSize: 18, opacity: 0.9 }}>{banner.description}</Text>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <div className="page-container" style={{ marginBottom: 24 }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FireOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
          <span style={{ fontSize: 20, fontWeight: 600 }}>热门服务</span>
          <Tag color="blue" style={{ marginLeft: 'auto', fontSize: 14 }}>
            {currentCity} · 可服务
          </Tag>
        </div>
        {services && services.length > 0 ? (
          <Row gutter={[24, 24]}>
            {services.map((service) => (
              <Col xs={24} sm={12} lg={8} key={service.id}>
                <ServiceCard service={service} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="empty-state">
            <Empty
              description={
                <div>
                  <p style={{ marginBottom: 8 }}>暂无服务</p>
                  <Button size="small" type="primary" onClick={() => window.location.reload()}>
                    重新加载
                  </Button>
                </div>
              }
            />
          </div>
        )}
      </div>

      <div className="page-container">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarOutlined style={{ color: '#faad14', fontSize: 20 }} />
          <span style={{ fontSize: 20, fontWeight: 600 }}>优质保洁师推荐</span>
        </div>
        {topCleaners && topCleaners.length > 0 ? (
          <Row gutter={[24, 24]}>
            {topCleaners.map((cleaner) => (
              <Col xs={24} lg={12} key={cleaner.id}>
                <CleanerCard
                  cleaner={cleaner}
                  onBook={() => {
                    navigate('/login')
                  }}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="empty-state">
            <Empty
              description={
                <div>
                  <p style={{ marginBottom: 8 }}>暂无保洁师数据</p>
                  <Button size="small" type="primary" onClick={() => window.location.reload()}>
                    重新加载
                  </Button>
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
