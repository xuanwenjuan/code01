import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Row, Col, Image, Rate, Button, Tabs, Divider, List, Avatar, Card, Space, message,
  Breadcrumb, Descriptions, Statistic, Steps, Select, Tag,
} from 'antd'
import {
  HeartOutlined, HeartFilled, EnvironmentOutlined, ClockCircleOutlined,
  ShoppingCartOutlined, CheckCircleOutlined, HomeOutlined, AppstoreOutlined,
  CalendarOutlined, UserOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { setCurrentService, toggleFavorite } from '@/store/slices/serviceSlice'
import PageState from '@/components/common/PageState'
import { useFavorite } from '@/hooks/useFavorite'
import { formatPrice, formatDuration, formatDistance, formatDateTime } from '@/utils'
import { mockReviews, mockGroomers } from '@/mock/data'

const { TabPane } = Tabs
const { Option } = Select

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { services, currentService } = useSelector((state) => state.service)
  const { isLoggedIn } = useSelector((state) => state.user)
  const { currentCity } = useSelector((state) => state.app)
  const { isFavorite, toggleFavorite: toggleFav } = useFavorite()
  const [activeTab, setActiveTab] = useState('detail')
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [selectedPrice, setSelectedPrice] = useState(null)

  const service = useMemo(() => {
    return services.find((s) => s.id === parseInt(id)) || currentService
  }, [services, id, currentService])

  const groomer = useMemo(() => {
    if (service?.groomerId) {
      return mockGroomers.find((g) => g.id === service.groomerId)
    }
    return null
  }, [service])

  const serviceReviews = useMemo(() => {
    return mockReviews.filter((r) => r.serviceId === service?.id)
  }, [service])

  const durationOptions = useMemo(() => {
    if (!service?.priceList) return []
    return service.priceList.map((item, index) => ({
      value: index,
      label: `${item.name} (${formatPrice(item.price)})`,
    }))
  }, [service])

  useEffect(() => {
    if (service) {
      dispatch(setCurrentService(service))
      if (service.priceList && service.priceList.length > 0) {
        setSelectedDuration(0)
        setSelectedPrice(service.priceList[0].price)
      }
    }
  }, [service, dispatch])

  const handleDurationChange = (value) => {
    setSelectedDuration(value)
    if (service?.priceList) {
      setSelectedPrice(service.priceList[value].price)
    }
  }

  const handleBooking = () => {
    if (!isLoggedIn) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    navigate(`/booking/${service.id}`)
  }

  const handleFavorite = () => {
    if (!isLoggedIn) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    toggleFav(service.id)
    message.success(isFavorite(service.id) ? '已取消收藏' : '收藏成功')
  }

  const getCategoryName = (categoryId) => {
    const categories = [
      { id: 'wash', name: '宠物洗护' },
      { id: 'boarding', name: '宠物寄养' },
      { id: 'beauty', name: '宠物美容' },
      { id: 'medical', name: '宠物医疗' },
      { id: 'training', name: '宠物训练' },
      { id: 'grooming', name: '宠物SPA' },
      { id: 'delivery', name: '上门服务' },
    ]
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : '宠物服务'
  }

  if (!service) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <PageState data={null} emptyText="服务不存在" />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <Breadcrumb
            items={[
              { title: <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}><HomeOutlined /> 首页</span> },
              { title: <span onClick={() => navigate('/services')} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}><AppstoreOutlined /> 服务列表</span> },
              { title: <span style={{ color: '#fff' }}>{service.name}</span> },
            ]}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}
          />
          <h1 style={{ color: '#fff', fontSize: 28, margin: 0 }}>{service.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, marginBottom: 0 }}>
            <span style={{ marginRight: 24 }}>📍 {currentCity}</span>
            <span style={{ marginRight: 24 }}>⭐ {service.rating} 分</span>
            <span>📦 已售 {service.sales} 单</span>
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 40, paddingTop: 24 }}>
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Row gutter={32}>
            <Col xs={24} md={10}>
              <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                <Image
                  src={service.image}
                  alt={service.name}
                  width="100%"
                  style={{ borderRadius: 8 }}
                />
              </div>
              <Row gutter={8}>
                {[1, 2, 3, 4].map((i) => (
                  <Col span={6} key={i}>
                    <Image
                      src={service.image}
                      alt={`${service.name} ${i}`}
                      width="100%"
                      style={{ borderRadius: 4, cursor: 'pointer' }}
                    />
                  </Col>
                ))}
              </Row>
            </Col>

            <Col xs={24} md={14}>
              <Space wrap style={{ marginBottom: 12 }}>
                <Tag color="blue">{getCategoryName(service.category)}</Tag>
                {service.tags?.map((tag, index) => (
                  <Tag key={index} color="orange">{tag}</Tag>
                ))}
              </Space>

              <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>
                {service.name}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <Space>
                  <Rate disabled value={service.rating} allowHalf />
                  <span style={{ color: '#fa8c16', fontWeight: 500 }}>{service.rating}</span>
                </Space>
                <Divider type="vertical" />
                <span style={{ color: '#666' }}>{service.reviewCount} 条评价</span>
                <Divider type="vertical" />
                <span style={{ color: '#666' }}>已售 {service.sales} 单</span>
              </div>

              <p style={{ color: '#666', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
                {service.description}
              </p>

              <Row gutter={[16, 12]} style={{ marginBottom: 20 }}>
                <Col xs={12}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666' }}>
                    <EnvironmentOutlined style={{ color: '#ff6b35' }} />
                    <span>{service.address}</span>
                  </div>
                </Col>
                <Col xs={12}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666' }}>
                    <ClockCircleOutlined style={{ color: '#ff6b35' }} />
                    <span>服务时长：{formatDuration(service.duration)}</span>
                  </div>
                </Col>
                <Col xs={12}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666' }}>
                    <span>📍 距您：{formatDistance(service.distance)}</span>
                  </div>
                </Col>
              </Row>

              {service.priceList && service.priceList.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 500, marginBottom: 12, color: '#333' }}>
                    选择服务套餐：
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={selectedDuration}
                    onChange={handleDurationChange}
                    options={durationOptions}
                    placeholder="请选择服务套餐"
                  />
                  {service.priceList[selectedDuration] && (
                    <div style={{ marginTop: 8, padding: 12, background: '#fff7e6', borderRadius: 6 }}>
                      <div style={{ color: '#666', fontSize: 13, marginBottom: 4 }}>
                        包含项目：{service.priceList[selectedDuration].include}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Divider style={{ margin: '20px 0' }} />

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
                <span style={{ color: '#ff6b35', fontSize: 36, fontWeight: 'bold' }}>
                  {formatPrice(selectedPrice || service.price)}
                </span>
                {service.originalPrice > (selectedPrice || service.price) && (
                  <>
                    <span style={{ color: '#999', textDecoration: 'line-through', fontSize: 16 }}>
                      {formatPrice(service.originalPrice)}
                    </span>
                    <Tag color="red" style={{ fontSize: 14, padding: '2px 8px' }}>
                      省{formatPrice(service.originalPrice - (selectedPrice || service.price))}
                    </Tag>
                  </>
                )}
              </div>

              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleBooking}
                  style={{ height: 48, padding: '0 48px', fontSize: 16 }}
                >
                  立即预约
                </Button>
                <Button
                  size="large"
                  icon={isFavorite(service.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                  onClick={handleFavorite}
                  style={{ height: 48, padding: '0 32px', fontSize: 16 }}
                >
                  {isFavorite(service.id) ? '已收藏' : '收藏'}
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: 12 }}>
              <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
                <TabPane tab="服务详情" key="detail">
                  <div style={{ padding: '16px 0' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>服务介绍</h3>
                    <p style={{ color: '#666', lineHeight: 2, fontSize: 15, marginBottom: 24 }}>
                      {service.description}。我们拥有专业的服务团队，为您的爱宠提供最优质的服务体验。
                      所有服务人员均经过专业培训，持证上岗，确保服务质量和宠物安全。
                      我们使用进口环保洗护产品，呵护宠物健康，让您的爱宠享受专业级的护理服务。
                    </p>

                    {service.serviceFlow && service.serviceFlow.length > 0 && (
                      <>
                        <Divider />
                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>服务流程</h3>
                        <Steps
                          direction="vertical"
                          size="small"
                          items={service.serviceFlow.map((step) => ({
                            title: <span style={{ fontWeight: 500 }}>{step.title}</span>,
                            description: <span style={{ color: '#666' }}>{step.desc}</span>,
                            status: 'finish',
                          }))}
                        />
                      </>
                    )}

                    {service.priceList && service.priceList.length > 0 && (
                      <>
                        <Divider />
                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>收费标准</h3>
                        <Row gutter={[16, 16]}>
                          {service.priceList.map((item, index) => (
                            <Col xs={24} sm={12} key={index}>
                              <Card
                                size="small"
                                style={{
                                  borderRadius: 8,
                                  border: selectedDuration === index ? '2px solid #ff6b35' : '1px solid #f0f0f0',
                                  background: selectedDuration === index ? '#fff7e6' : '#fff',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontWeight: 600, fontSize: 16 }}>{item.name}</span>
                                  <span style={{ color: '#ff6b35', fontSize: 20, fontWeight: 'bold' }}>
                                    {formatPrice(item.price)}
                                  </span>
                                </div>
                                <p style={{ color: '#666', fontSize: 13, margin: 0 }}>{item.include}</p>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </>
                    )}
                  </div>
                </TabPane>

                <TabPane tab={`用户评价 (${service.reviewCount})`} key="reviews">
                  <div style={{ padding: '16px 0' }}>
                    <List
                      dataSource={serviceReviews}
                      renderItem={(review) => (
                        <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                              <Avatar src={review.userAvatar} size={48} />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>{review.userName}</div>
                                <Space>
                                  <Rate disabled value={review.rating} allowHalf style={{ fontSize: 12 }} />
                                  <span style={{ color: '#999', fontSize: 12 }}>
                                    {formatDateTime(review.createdAt)}
                                  </span>
                                </Space>
                              </div>
                            </div>
                            <p style={{ color: '#333', fontSize: 14, lineHeight: 1.8, margin: 0, paddingLeft: 60 }}>
                              {review.content}
                            </p>
                          </div>
                        </List.Item>
                      )}
                    />
                    {serviceReviews.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                        <UserOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                        <p>暂无评价，快来成为第一个评价的人吧！</p>
                      </div>
                    )}
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {groomer && (
              <Card
                title="服务宠物师"
                style={{ marginBottom: 24, borderRadius: 12 }}
                extra={<Button type="link" size="small">查看详情</Button>}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <Avatar src={groomer.avatar} size={64} style={{ border: '2px solid #ff6b35', padding: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                      {groomer.name}
                    </div>
                    <div style={{ color: '#ff6b35', fontSize: 13, marginBottom: 8 }}>
                      {groomer.title}
                    </div>
                    <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
                      <Col span={12}>
                        <div style={{ color: '#666', fontSize: 12 }}>从业 {groomer.experience} 年</div>
                      </Col>
                      <Col span={12}>
                        <div style={{ color: '#666', fontSize: 12 }}>评分 {groomer.rating} 分</div>
                      </Col>
                    </Row>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {groomer.specialty.map((s, i) => (
                        <Tag key={i} size="small" color="blue">{s}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Card title="服务保障" style={{ marginBottom: 24, borderRadius: 12 }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>专业认证服务</div>
                    <div style={{ color: '#999', fontSize: 12 }}>所有服务人员持证上岗</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>不满意可退款</div>
                    <div style={{ color: '#999', fontSize: 12 }}>服务不满意可申请退款</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>全程视频监控</div>
                    <div style={{ color: '#999', fontSize: 12 }}>服务过程可观看直播</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>24小时客服</div>
                    <div style={{ color: '#999', fontSize: 12 }}>客服热线：400-888-8888</div>
                  </div>
                </div>
              </Space>
            </Card>

            <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)' }}>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                  💰 新用户专享
                </div>
                <div style={{ fontSize: 14, marginBottom: 16, opacity: 0.9 }}>
                  首单立减30元，还有更多优惠券等你拿！
                </div>
                <Button
                  type="primary"
                  block
                  style={{
                    background: '#fff',
                    borderColor: '#fff',
                    color: '#ff6b35',
                    fontWeight: 600,
                  }}
                >
                  立即领取优惠券
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
