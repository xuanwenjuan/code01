import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Row,
  Col,
  Rate,
  Tag,
  Button,
  Card,
  Tabs,
  Avatar,
  Divider,
  Steps,
  InputNumber,
  message,
  FloatButton,
  Breadcrumb,
  Descriptions
} from 'antd'
import {
  EnvironmentOutlined,
  FireOutlined,
  HeartOutlined,
  HeartFilled,
  UserOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons'
import { useState, useMemo } from 'react'
import Loading from '@/components/Common/Loading'
import EmptyState from '@/components/Common/EmptyState'
import { toggleFavorite } from '@/store/slices/userSlice'
import { setCurrentBooking } from '@/store/slices/orderSlice'
import { useAuth } from '@/hooks/useAuth'
import { mockCategories } from '@/mock/data'
import './style.css'

const { Step } = Steps

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLogin } = useAuth()
  const { services } = useSelector(state => state.service)
  const { favorites } = useSelector(state => state.user)

  const [duration, setDuration] = useState(2)

  const service = useMemo(() => {
    return services.find(s => s.id === Number(id))
  }, [services, id])

  const isFavorite = favorites.includes(Number(id))
  const totalPrice = service ? service.price * duration : 0

  const categoryName = useMemo(() => {
    if (!service) return ''
    const cat = mockCategories.find(c => c.id === service.category)
    return cat ? cat.name : ''
  }, [service])

  const handleToggleFavorite = () => {
    if (!isLogin) {
      navigate('/login')
      return
    }
    dispatch(toggleFavorite(Number(id)))
    message.success(isFavorite ? '已取消收藏' : '收藏成功')
  }

  const handleBooking = () => {
    if (!isLogin) {
      navigate('/login')
      return
    }
    dispatch(setCurrentBooking({
      serviceId: service.id,
      serviceName: service.name,
      serviceImage: service.image,
      price: service.price,
      priceUnit: service.priceUnit,
      duration,
      totalPrice
    }))
    navigate('/booking')
  }

  if (!service) {
    return (
      <div className="container" style={{ padding: 40 }}>
        <EmptyState description="服务不存在或已下架" />
      </div>
    )
  }

  const tabItems = [
    {
      key: 'intro',
      label: '服务介绍',
      children: (
        <div style={{ padding: '24px 8px' }}>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 16,
              paddingLeft: 12,
              borderLeft: '4px solid #1677ff'
            }}>
              服务详情
            </h3>
            <p style={{
              lineHeight: 2,
              color: '#444',
              fontSize: 15,
              textIndent: '2em',
              background: '#fafafa',
              padding: 20,
              borderRadius: 8
            }}>
              {service.description}
            </p>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 16,
              paddingLeft: 12,
              borderLeft: '4px solid #52c41a'
            }}>
              服务特色
            </h3>
            <Row gutter={[16, 16]}>
              {service.features.map(feature => (
                <Col xs={24} sm={12} key={feature}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px 20px',
                    background: '#f6ffed',
                    borderRadius: 8,
                    border: '1px solid #b7eb8f'
                  }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                    <span style={{ fontWeight: 500, color: '#389e0d' }}>{feature}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          <div>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 24,
              paddingLeft: 12,
              borderLeft: '4px solid #faad14'
            }}>
              服务流程
            </h3>
            <div style={{ background: '#fffbe6', padding: '24px', borderRadius: 8 }}>
              <Steps direction="vertical" current={-1}>
                {service.process.map(item => (
                  <Step
                    key={item.step}
                    title={<span style={{ fontWeight: 600, fontSize: 16 }}>{item.title}</span>}
                    description={<span style={{ color: '#666' }}>{item.desc}</span>}
                    icon={
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#faad14',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: 16
                      }}>
                        {item.step}
                      </div>
                    }
                  />
                ))}
              </Steps>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'reviews',
      label: `用户评价 (${service.reviews.length})`,
      children: (
        <div style={{ padding: '24px 8px' }}>
          {service.reviews.length > 0 ? (
            <div>
              {service.reviews.map(review => (
                <div
                  key={review.id}
                  style={{
                    padding: 20,
                    borderBottom: '1px solid #f0f0f0',
                    background: '#fafafa',
                    marginBottom: 12,
                    borderRadius: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Avatar size={48} src={review.avatar} icon={<UserOutlined />} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 15 }}>{review.userName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
                        <span style={{ color: '#faad14', fontSize: 12 }}>{review.rating}分</span>
                      </div>
                    </div>
                    <span style={{ color: '#999', marginLeft: 'auto', fontSize: 12 }}>{review.time}</span>
                  </div>
                  <p style={{ color: '#444', margin: 0, lineHeight: 1.8, fontSize: 14 }}>{review.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState description="暂无评价，快来成为第一个评价的人吧！" />
          )}
        </div>
      )
    }
  ]

  return (
    <div className="service-detail-page">
      <div className="container">
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item href="/">
            <HomeOutlined />
            <span>首页</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/services">全部服务</Breadcrumb.Item>
          {categoryName && <Breadcrumb.Item href={`/services?category=${service.category}`}>{categoryName}</Breadcrumb.Item>}
          <Breadcrumb.Item>{service.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Card bordered={false} style={{ borderRadius: 8, marginBottom: 24, overflow: 'hidden' }}>
          <Row gutter={24}>
            <Col lg={10} md={12} sm={24}>
              <div style={{ position: 'relative' }}>
                <img
                  src={service.image}
                  alt={service.name}
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    height: 360,
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}>
                  {categoryName}
                </div>
              </div>
            </Col>
            <Col lg={14} md={12} sm={24}>
              <div style={{ padding: '8px 0' }}>
                <h1 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: '#1f1f1f'
                }}>
                  {service.name}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Rate disabled value={service.rating} style={{ fontSize: 16 }} />
                    <span style={{ color: '#faad14', fontWeight: 600, fontSize: 16 }}>{service.rating}</span>
                  </div>
                  <Tag icon={<FireOutlined />} color="orange" style={{ padding: '4px 12px', fontSize: 13 }}>
                    已售 {service.orderCount} 单
                  </Tag>
                  <Tag icon={<UsergroupAddOutlined />} color="blue" style={{ padding: '4px 12px', fontSize: 13 }}>
                    {service.workerCount} 位师傅
                  </Tag>
                  <Tag icon={<EnvironmentOutlined />} color="green" style={{ padding: '4px 12px', fontSize: 13 }}>
                    距您 {service.distance}km
                  </Tag>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ background: 'linear-gradient(135deg, #fff1f0 0%, #fff7e6 100%)', padding: 20, borderRadius: 8, marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ color: '#666', fontSize: 14 }}>服务价格</span>
                    <span style={{ fontSize: 36, fontWeight: 700, color: '#ff4d4f' }}>
                      ¥{service.price}
                    </span>
                    <span style={{ color: '#999', fontSize: 14 }}>/{service.priceUnit}</span>
                  </div>
                </div>

                <Descriptions column={2} size="small" style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="服务分类">{categoryName}</Descriptions.Item>
                  <Descriptions.Item label="服务时长">1-8小时可选</Descriptions.Item>
                  <Descriptions.Item label="服务范围">全市均可上门</Descriptions.Item>
                  <Descriptions.Item label="服务时间">9:00 - 21:00</Descriptions.Item>
                </Descriptions>

                <div style={{ marginBottom: 24 }}>
                  <span style={{ marginRight: 16, color: '#666' }}>选择服务时长：</span>
                  <InputNumber
                    min={1}
                    max={8}
                    value={duration}
                    onChange={setDuration}
                    addonAfter="小时"
                    size="large"
                    style={{ width: 140 }}
                  />
                </div>

                <div style={{
                  background: '#f5f5f5',
                  padding: 20,
                  borderRadius: 8,
                  marginBottom: 24,
                  border: '1px dashed #d9d9d9'
                }}>
                  <div className="flex-between" style={{ marginBottom: 8 }}>
                    <span style={{ color: '#666' }}>单价</span>
                    <span>¥{service.price}</span>
                  </div>
                  <div className="flex-between" style={{ marginBottom: 8 }}>
                    <span style={{ color: '#666' }}>服务时长</span>
                    <span>{duration} 小时</span>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div className="flex-between">
                    <span style={{ fontSize: 16, fontWeight: 500 }}>预计总价</span>
                    <span style={{ fontSize: 28, fontWeight: 700, color: '#ff4d4f' }}>¥{totalPrice}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleBooking}
                    style={{ flex: 1, height: 48, fontSize: 16 }}
                  >
                    立即预约
                  </Button>
                  <Button
                    size="large"
                    icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                    onClick={handleToggleFavorite}
                    style={{ height: 48, minWidth: 100 }}
                  >
                    {isFavorite ? '已收藏' : '收藏'}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        <Card bordered={false} style={{ borderRadius: 8 }}>
          <Tabs
            items={tabItems}
            defaultActiveKey="intro"
            size="large"
            styles={{ tabBar: { padding: '0 16px', marginBottom: 0 } }}
          />
        </Card>
      </div>

      <FloatButton.BackTop />
    </div>
  )
}

export default ServiceDetail
