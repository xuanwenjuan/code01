import React, { useMemo } from 'react'
import { Carousel, Row, Col, Card, Button, Space, Tag } from 'antd'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  BathOutlined,
  HomeOutlined,
  ScissorsOutlined,
  MedicineBoxOutlined,
  TrophyOutlined,
  SmileOutlined,
  CarOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import ServiceCard from '@/components/common/ServiceCard'
import GroomerCard from '@/components/common/GroomerCard'
import PageState from '@/components/common/PageState'
import { useLoading } from '@/hooks/useLoading'

const iconMap = {
  BathOutlined: <BathOutlined />,
  HomeOutlined: <HomeOutlined />,
  ScissorsOutlined: <ScissorsOutlined />,
  MedicineBoxOutlined: <MedicineBoxOutlined />,
  TrophyOutlined: <TrophyOutlined />,
  SmileOutlined: <SmileOutlined />,
  CarOutlined: <CarOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
}

const Home = () => {
  const navigate = useNavigate()
  const { banners, categories, activities } = useSelector((state) => state.app)
  const { services, groomers } = useSelector((state) => state.service)
  const { loading } = useLoading(false)

  const hotServices = useMemo(() => {
    return [...services].sort((a, b) => b.sales - a.sales).slice(0, 8)
  }, [services])

  const handleCategoryClick = (categoryId) => {
    navigate(`/services?category=${categoryId}`)
  }

  return (
    <div>
      <div className="container" style={{ paddingTop: 24 }}>
        <Carousel autoplay style={{ marginBottom: 32, borderRadius: 8, overflow: 'hidden' }}>
          {banners.map((banner) => (
            <div key={banner.id} onClick={() => navigate(banner.link)} style={{ cursor: 'pointer' }}>
              <div
                style={{
                  height: 360,
                  backgroundImage: `url(${banner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 60,
                }}
              >
                <div style={{ color: '#fff' }}>
                  <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
                    {banner.title}
                  </h1>
                  <p style={{ fontSize: 18, marginBottom: 16 }}>{banner.subtitle}</p>
                  <Button type="primary" size="large">
                    立即查看
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>服务分类</h3>
          <Row gutter={[16, 16]}>
            {categories.map((category) => (
              <Col xs={6} sm={4} lg={3} key={category.id}>
                <div
                  onClick={() => handleCategoryClick(category.id)}
                  style={{
                    textAlign: 'center',
                    padding: '20px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  className="card-hover"
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: category.color + '20',
                      color: category.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      fontSize: 24,
                    }}
                  >
                    {iconMap[category.icon]}
                  </div>
                  <div style={{ fontSize: 14, color: '#333' }}>{category.name}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              热门服务
            </h2>
            <Button type="link" onClick={() => navigate('/services')}>
              查看更多 <ArrowRightOutlined />
            </Button>
          </div>
          <PageState loading={loading} data={hotServices}>
            <Row gutter={[16, 16]}>
              {hotServices.map((service) => (
                <Col xs={24} sm={12} lg={6} key={service.id}>
                  <ServiceCard service={service} />
                </Col>
              ))}
            </Row>
          </PageState>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <h2 className="section-title" style={{ margin: 0, marginBottom: 20 }}>
            限时优惠活动
          </h2>
          <Row gutter={16}>
            {activities.map((activity) => (
              <Col xs={24} sm={8} key={activity.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      src={activity.image}
                      alt={activity.title}
                      style={{ height: 140, objectFit: 'cover' }}
                    />
                  }
                  onClick={() => navigate(activity.link)}
                  styles={{ body: { padding: 16 } }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                    {activity.title}
                  </div>
                  <div style={{ color: '#ff6b35', fontSize: 14 }}>{activity.subtitle}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              优质宠物师
            </h2>
            <Button type="link">查看更多 <ArrowRightOutlined /></Button>
          </div>
          <PageState loading={loading} data={groomers}>
            <Row gutter={[16, 16]}>
              {groomers.map((groomer) => (
                <Col xs={24} lg={12} key={groomer.id}>
                  <GroomerCard groomer={groomer} />
                </Col>
              ))}
            </Row>
          </PageState>
        </div>
      </div>
    </div>
  )
}

export default Home
