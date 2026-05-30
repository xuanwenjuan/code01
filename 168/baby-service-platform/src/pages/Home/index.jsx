import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Carousel, Card, Row, Col, Button, Modal, Tag } from 'antd'
import { ArrowRightOutlined, GiftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ServiceCard from '@/components/Common/ServiceCard'
import NannyCard from '@/components/Common/NannyCard'
import LoadingState from '@/components/Common/LoadingState'
import { formatPrice } from '@/utils'

const Home = () => {
  const navigate = useNavigate()
  const { banners, categories, services, nannies, promotions } = useSelector(state => state.service)
  const [loading, setLoading] = useState(true)
  const [newUserModalVisible, setNewUserModalVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
      if (!hasSeenWelcome) {
        setNewUserModalVisible(true)
        localStorage.setItem('hasSeenWelcome', 'true')
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const SectionTitle = ({ title, extra = null }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div className="section-title-wrapper" style={{ marginBottom: 0 }}>
        <div className="section-title-icon" />
        <h2 className="section-title-text" style={{ fontSize: 20 }}>{title}</h2>
      </div>
      {extra}
    </div>
  )

  if (loading) {
    return <LoadingState />
  }

  return (
    <div>
      <div className="container" style={{ padding: '24px 0' }}>
        <Carousel
          autoplay
          style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 32 }}
          dotStyle={{ width: 24, height: 4, borderRadius: 2 }}
          dotActiveStyle={{ width: 32, height: 4, borderRadius: 2, background: '#ff6b9d' }}
        >
          {banners.map(banner => (
            <div key={banner.id}>
              <div
                style={{
                  height: 360,
                  background: `url(${banner.image}) center/cover`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: '#fff',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,107,157,0.3) 0%, rgba(0,0,0,0.3) 100%)'
                }} />
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, color: '#fff' }}>{banner.title}</h2>
                  <p style={{ fontSize: 18, opacity: 0.95 }}>{banner.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        <Card className="card-shadow" style={{ marginBottom: 32 }} bodyStyle={{ padding: 24 }}>
          <SectionTitle title="服务分类" />
          <Row gutter={[16, 16]}>
            {categories.map(category => (
              <Col xs={6} sm={4} md={3} key={category.id}>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px 12px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: `${category.color}10`,
                    border: `1px solid ${category.color}20`
                  }}
                  onClick={() => navigate(`/services?category=${category.id}`)}
                  className="hover-scale"
                >
                  <div style={{ fontSize: 40, marginBottom: 8 }}>{category.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{category.name}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{category.description}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        <Card className="card-shadow" style={{ marginBottom: 32 }} bodyStyle={{ padding: 24 }}>
          <SectionTitle
            title="限时优惠"
            extra={
              <Button type="link" onClick={() => navigate('/services')} style={{ color: '#ff6b9d' }}>
                查看更多 <ArrowRightOutlined />
              </Button>
            }
          />
          <Row gutter={[16, 16]}>
            {promotions.map(promo => (
              <Col xs={24} sm={12} md={8} key={promo.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 160, overflow: 'hidden' }}>
                      <img
                        alt={promo.title}
                        src={promo.image}
                        style={{ height: '100%', width: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    </div>
                  }
                  bodyStyle={{ padding: 16 }}
                  className="hover-scale"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{promo.title}</span>
                    <Tag color="#ff6b9d" style={{ margin: 0 }}>{promo.discount}</Tag>
                  </div>
                  <div style={{ color: '#666', fontSize: 13, marginBottom: 12, minHeight: 36 }}>{promo.subtitle}</div>
                  <div style={{ color: '#999', fontSize: 12 }}>{promo.condition}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <Card className="card-shadow" style={{ marginBottom: 32 }} bodyStyle={{ padding: 24 }}>
          <SectionTitle
            title="优质母婴师"
            extra={
              <Button type="link" onClick={() => navigate('/nannies')} style={{ color: '#ff6b9d' }}>
                查看更多 <ArrowRightOutlined />
              </Button>
            }
          />
          <Row gutter={[16, 16]}>
            {nannies.slice(0, 4).map(nanny => (
              <Col xs={24} sm={12} md={6} key={nanny.id}>
                <NannyCard nanny={nanny} />
              </Col>
            ))}
          </Row>
        </Card>

        <Card className="card-shadow" bodyStyle={{ padding: 24 }}>
          <SectionTitle
            title="热门服务"
            extra={
              <Button type="link" onClick={() => navigate('/services')} style={{ color: '#ff6b9d' }}>
                查看更多 <ArrowRightOutlined />
              </Button>
            }
          />
          <Row gutter={[16, 16]}>
            {services.slice(0, 4).map(service => (
              <Col xs={24} sm={12} md={6} key={service.id}>
                <ServiceCard service={service} />
              </Col>
            ))}
          </Row>
        </Card>
      </div>

      <Modal
        title={
          <div style={{ textAlign: 'center', fontSize: 20 }}>
            <GiftOutlined style={{ color: '#ff6b9d', marginRight: 8 }} />
            新用户专享福利
          </div>
        }
        open={newUserModalVisible}
        onCancel={() => setNewUserModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setNewUserModalVisible(false)}>
            稍后再说
          </Button>,
          <Button key="claim" type="primary" onClick={() => {
            setNewUserModalVisible(false)
            navigate('/login')
          }}>
            立即领取
          </Button>
        ]}
        width={420}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎁</div>
          <h3 style={{ fontSize: 20, marginBottom: 8, fontWeight: 600 }}>首单立减200元</h3>
          <p style={{ color: '#666', marginBottom: 20 }}>新用户注册即可享受首单立减200元优惠</p>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fb1 100%)',
            color: '#fff',
            padding: '20px',
            borderRadius: 12,
            fontSize: 14
          }}>
            优惠券已放入您的账户
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Home
