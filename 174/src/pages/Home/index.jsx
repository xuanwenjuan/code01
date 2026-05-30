import React from 'react'
import { Carousel, Row, Col } from 'antd'
import useRequest from '@/hooks/useRequest'
import { getServices, getPackages, getBanners } from '@/mock/api'
import ServiceCard from '@/components/ServiceCard'
import PackageCard from '@/components/PackageCard'
import LoadingWrapper from '@/components/LoadingWrapper'
import './index.css'

const Home = () => {
  const { data: services, loading: servicesLoading } = useRequest(getServices)
  const { data: packages, loading: packagesLoading } = useRequest(getPackages)
  const { data: banners, loading: bannersLoading } = useRequest(getBanners)

  return (
    <div className="home-page">
      <section className="banner-section">
        <LoadingWrapper loading={bannersLoading}>
          <Carousel autoplay className="banner-carousel">
            {banners?.map(banner => (
              <div key={banner.id} className="banner-item">
                <img src={banner.image} alt={banner.title} />
                <div className="banner-content">
                  <h2 className="banner-title">{banner.title}</h2>
                  <p className="banner-subtitle">{banner.subtitle}</p>
                </div>
              </div>
            ))}
          </Carousel>
        </LoadingWrapper>
      </section>

      <div className="container">
        <section className="page-content">
          <h2 className="section-title">清洗服务</h2>
          <LoadingWrapper loading={servicesLoading}>
            <Row gutter={[24, 24]}>
              {services?.map(service => (
                <Col key={service.id} xs={24} sm={12} md={8} lg={8}>
                  <ServiceCard service={service} />
                </Col>
              ))}
            </Row>
          </LoadingWrapper>
        </section>

        <section className="page-content">
          <h2 className="section-title">热门套餐</h2>
          <LoadingWrapper loading={packagesLoading}>
            <Row gutter={[24, 24]}>
              {packages?.map(pkg => (
                <Col key={pkg.id} xs={24} sm={12} md={12} lg={6}>
                  <PackageCard pkg={pkg} />
                </Col>
              ))}
            </Row>
          </LoadingWrapper>
        </section>

        <section className="page-content features-section">
          <h2 className="section-title">为什么选择我们</h2>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <div className="feature-item">
                <div className="feature-icon">👨‍🔧</div>
                <h3>专业师傅</h3>
                <p>持证上岗，经验丰富</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="feature-item">
                <div className="feature-icon">🧪</div>
                <h3>环保试剂</h3>
                <p>食品级清洁剂，安全无毒</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="feature-item">
                <div className="feature-icon">⏰</div>
                <h3>准时上门</h3>
                <p>约定时间，准时到达</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="feature-item">
                <div className="feature-icon">🛡️</div>
                <h3>售后保障</h3>
                <p>服务不满意，免费返工</p>
              </div>
            </Col>
          </Row>
        </section>
      </div>
    </div>
  )
}

export default Home
