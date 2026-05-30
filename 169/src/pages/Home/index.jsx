import React from 'react'
import { Carousel, Row, Col, Card, Button, Space, Tag } from 'antd'
import { RightOutlined, FireOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ServiceCard from '@/components/Common/ServiceCard'
import TechnicianCard from '@/components/Common/TechnicianCard'
import { banners, categories, promotions } from '@/mock/data'

const Home = () => {
  const navigate = useNavigate()
  const { services, technicians } = useSelector((state) => state.service)
  const currentCity = useSelector((state) => state.app.currentCity)

  const hotServices = services.slice(0, 8)
  const topTechnicians = technicians.slice(0, 4)

  return (
    <div className="home-page">
      <section className="banner-section">
        <Carousel autoplay effect="fade" className="main-banner">
          {banners.map((banner) => (
            <div key={banner.id} className="banner-item" style={{ backgroundColor: banner.color }}>
              <div className="banner-content">
                <h1>{banner.title}</h1>
                <p>{banner.subtitle}</p>
                <Button type="primary" size="large" onClick={() => navigate('/services')}>
                  立即预约
                </Button>
              </div>
            </div>
          ))}
        </Carousel>
      </section>

      <section className="categories-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">维修服务分类</h2>
          </div>
          <Row gutter={[24, 24]}>
            {categories.map((category) => (
              <Col xs={6} sm={6} md={4} lg={3} key={category.id}>
                <div
                  className="category-item"
                  onClick={() =>
                    navigate('/services', { state: { category: category.id } })
                  }
                >
                  <span className="category-icon">{category.icon}</span>
                  <p className="category-name">{category.name}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="promotions-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              <FireOutlined className="title-icon" />
              限时优惠活动
            </h2>
            <Button type="link" onClick={() => navigate('/services')}>
              查看更多 <RightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {promotions.map((promo) => (
              <Col xs={12} sm={12} md={6} key={promo.id}>
                <Card className="promotion-card" hoverable>
                  <div className="promo-content">
                    <div className="promo-image" style={{ backgroundColor: promo.color }}>
                      <span className="promo-icon">🎁</span>
                    </div>
                    <div className="promo-info">
                      <Tag color="red" className="promo-tag">
                        <ClockCircleOutlined /> 限时
                      </Tag>
                      <h3 className="promo-title">{promo.title}</h3>
                      <p className="promo-subtitle">{promo.subtitle}</p>
                      <div className="promo-discount">
                        {typeof promo.discount === 'number' ? (
                          <span>
                            立减 <strong>¥{promo.discount}</strong>
                          </span>
                        ) : (
                          <span>
                            优惠 <strong>{promo.discount}</strong>
                          </span>
                        )}
                      </div>
                      <p className="promo-expiry">有效期至 {promo.expiry}</p>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="hot-services-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              <FireOutlined className="title-icon" />
              热门维修服务
            </h2>
            <Button type="link" onClick={() => navigate('/services')}>
              查看更多 <RightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {hotServices.map((service) => (
              <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
                <ServiceCard service={service} />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="technicians-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">优质维修师傅推荐</h2>
            <Button type="link" onClick={() => navigate('/services')}>
              查看更多 <RightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {topTechnicians.map((tech) => (
              <Col xs={24} sm={12} md={6} key={tech.id}>
                <TechnicianCard technician={tech} />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="features-section">
        <div className="section-container">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <div className="feature-item">
                <div className="feature-icon">🛡️</div>
                <h3>品质保障</h3>
                <p>30天质保，维修无忧</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="feature-item">
                <div className="feature-icon">⏱️</div>
                <h3>快速响应</h3>
                <p>30分钟内响应，当天上门</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="feature-item">
                <div className="feature-icon">💰</div>
                <h3>明码标价</h3>
                <p>价格透明，无隐形消费</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="feature-item">
                <div className="feature-icon">👨‍🔧</div>
                <h3>专业团队</h3>
                <p>持证上岗，经验丰富</p>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  )
}

export default Home
