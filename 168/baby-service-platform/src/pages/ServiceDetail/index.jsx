import React, { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Row, Col, Card, Rate, Tag, Button, Image, Steps, List,
  Avatar, Divider, message, Descriptions, Empty, Spin
} from 'antd'
import {
  HeartOutlined, HeartFilled, EnvironmentOutlined,
  ShoppingCartOutlined, CalendarOutlined,
  ClockCircleOutlined, PhoneOutlined, ShopOutlined
} from '@ant-design/icons'
import LoadingState from '@/components/Common/LoadingState'
import ServiceCard from '@/components/Common/ServiceCard'
import { useFavorite } from '@/hooks/useFavorite'
import { useAuth } from '@/hooks/useAuth'
import { setCurrentService } from '@/store/slices/serviceSlice'
import { formatPrice, formatDate } from '@/utils'

const { Step } = Steps

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { services } = useSelector(state => state.service)
  const { isFavorite, handleToggleFavorite } = useFavorite()
  const { isLoggedIn, isMom } = useAuth()

  const [loading, setLoading] = useState(true)
  const [selectedCycle, setSelectedCycle] = useState(null)

  const service = services.find(s => s.id === Number(id))

  const relatedServices = useMemo(() => {
    if (!service) return []
    return services
      .filter(s => s.categoryId === service.categoryId && s.id !== service.id)
      .slice(0, 4)
  }, [service, services])

  useEffect(() => {
    dispatch(setCurrentService(Number(id)))
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [id, dispatch])

  useEffect(() => {
    if (service?.serviceCycle?.length > 0) {
      setSelectedCycle(service.serviceCycle[0])
    }
  }, [service])

  if (loading) {
    return <LoadingState />
  }

  if (!service) {
    return (
      <div className="container page-content">
        <Empty
          description="服务不存在或已下架"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/')}>返回首页</Button>
        </Empty>
      </div>
    )
  }

  const favorited = isFavorite(service.id)

  const handleBook = () => {
    if (!isLoggedIn) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    if (!isMom) {
      message.warning('只有宝妈用户可以预约服务')
      return
    }
    navigate(`/booking/${service.id}?cycle=${encodeURIComponent(selectedCycle)}`)
  }

  const SectionTitle = ({ children, title, extra = null }) => (
    <>
      <div className="section-title-wrapper">
        <div className="section-title-icon" />
        <h3 className="section-title-text">{title}</h3>
        {extra}
      </div>
      {children}
    </>
  )

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>{service.name}</h1>
          <p>{service.category} · {service.address}</p>
        </div>
      </div>

      <div className="container page-content">
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Card className="card-shadow" style={{ marginBottom: 24 }}>
              <Image
                src={service.image}
                alt={service.name}
                className="service-detail-image"
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <h1 style={{ fontSize: 24, marginBottom: 0 }}>{service.name}</h1>
                <Tag color="#ff6b9d" style={{ padding: '4px 12px', fontSize: 13 }}>{service.category}</Tag>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Rate disabled value={service.rating} />
                  <span style={{ color: '#ff6b9d', fontWeight: 600, fontSize: 16 }}>{service.rating}</span>
                  <span style={{ color: '#999' }}>({service.reviewCount}条评价)</span>
                </div>
                <div style={{ color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <EnvironmentOutlined />
                  {service.distance}km
                </div>
                <div style={{ color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShopOutlined />
                  已售{service.sales}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {service.features?.map((feature, index) => (
                  <Tag key={index} className="service-feature-tag">
                    {feature}
                  </Tag>
                ))}
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <SectionTitle title="服务介绍">
                <p style={{ color: '#666', lineHeight: 2, fontSize: 14, marginBottom: 24 }}>
                  {service.description}
                </p>
              </SectionTitle>

              <Divider style={{ margin: '12px 0' }} />

              <SectionTitle title="服务流程">
                <Steps direction="vertical" size="small" style={{ marginBottom: 24 }}>
                  {service.serviceFlow?.map((step, index) => (
                    <Step key={index} title={step.title} description={step.desc} />
                  ))}
                </Steps>
              </SectionTitle>

              <Divider style={{ margin: '12px 0' }} />

              <SectionTitle title="服务周期">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                  {service.serviceCycle?.map((cycle, index) => (
                    <div
                      key={index}
                      className={`cycle-option ${selectedCycle === cycle ? 'active' : ''}`}
                      onClick={() => setSelectedCycle(cycle)}
                    >
                      {cycle}
                    </div>
                  ))}
                </div>
              </SectionTitle>

              <Divider style={{ margin: '12px 0' }} />

              <SectionTitle title="收费标准">
                <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                  {service.priceDetail?.map((item, index) => (
                    <Descriptions.Item key={index} label={item.item}>
                      {formatPrice(item.price)}
                    </Descriptions.Item>
                  ))}
                  <Descriptions.Item label="合计">
                    <span className="price-text" style={{ fontSize: 20, fontWeight: 700 }}>
                      {formatPrice(service.price)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </SectionTitle>

              {service.nanny && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <SectionTitle title="服务人员">
                    <div className="nanny-preview-card">
                      <Avatar size={64} src={service.nanny.avatar} className="nanny-preview-avatar" />
                      <div className="nanny-preview-info">
                        <div className="nanny-preview-name">{service.nanny.name}</div>
                        <div className="nanny-preview-desc">
                          {service.nanny.age}岁 · {service.nanny.experience}年经验
                        </div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                          {service.nanny.skills?.map((skill, i) => (
                            <Tag key={i} color="blue" style={{ margin: 0, fontSize: 11 }}>{skill}</Tag>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Rate disabled value={service.nanny.rating} style={{ fontSize: 12 }} />
                        <div style={{ color: '#ff6b9d', fontWeight: 600, fontSize: 14 }}>{service.nanny.rating}分</div>
                        <div style={{ color: '#999', fontSize: 12 }}>{service.nanny.orderCount}单</div>
                      </div>
                    </div>
                  </SectionTitle>
                </>
              )}

              <Divider style={{ margin: '12px 0' }} />

              <SectionTitle title={`宝妈评价 (${service.reviewCount})`}>
                {service.reviews?.length > 0 ? (
                  <div>
                    {service.reviews.map((review) => (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <Avatar src={review.userAvatar} size={40} />
                          <div className="review-user-info">
                            <div className="review-user-name">{review.userName}</div>
                            <div className="review-time">{formatDate(review.time)}</div>
                          </div>
                          <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
                        </div>
                        <div className="review-content">{review.content}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    description="暂无评价，快来抢首评吧~"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: '40px 0' }}
                  />
                )}
              </SectionTitle>
            </Card>

            {relatedServices.length > 0 && (
              <Card className="card-shadow related-services">
                <SectionTitle title="相关服务推荐">
                  <Row gutter={[16, 16]}>
                    {relatedServices.map(s => (
                      <Col xs={24} sm={12} key={s.id}>
                        <ServiceCard service={s} />
                      </Col>
                    ))}
                  </Row>
                </SectionTitle>
              </Card>
            )}
          </Col>

          <Col xs={24} md={8}>
            <Card className="card-shadow service-info-card">
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span className="service-price-large">
                    {formatPrice(service.price)}
                  </span>
                  {service.originalPrice > service.price && (
                    <span className="service-price-original">
                      {formatPrice(service.originalPrice)}
                    </span>
                  )}
                  <Tag color="red" style={{ marginLeft: 'auto' }}>限时优惠</Tag>
                </div>
                <div style={{ color: '#999', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CalendarOutlined />
                  已选周期：{selectedCycle || '请选择'}
                </div>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 2 }}>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <EnvironmentOutlined style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>{service.address}</span>
                </div>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClockCircleOutlined style={{ flexShrink: 0 }} />
                  <span>服务时间：9:00 - 21:00</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PhoneOutlined style={{ flexShrink: 0 }} />
                  <span>客服热线：400-123-4567</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  block
                  icon={
                    favorited
                      ? React.createElement(HeartFilled, { style: { color: '#ff6b9d' } })
                      : React.createElement(HeartOutlined)
                  }
                  onClick={() => handleToggleFavorite(service.id)}
                  style={{ flex: 1, height: 44 }}
                >
                  {favorited ? '已收藏' : '收藏'}
                </Button>
                <Button
                  type="primary"
                  block
                  icon={<ShoppingCartOutlined />}
                  onClick={handleBook}
                  style={{ flex: 2, height: 44, fontSize: 16 }}
                  size="large"
                >
                  立即预约
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default ServiceDetail
