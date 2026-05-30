import React, { useEffect, useState } from 'react'
import {
  Row,
  Col,
  Card,
  Rate,
  Button,
  Tag,
  Steps,
  Table,
  Avatar,
  List,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Space,
  message,
  Radio
} from 'antd'
import {
  EnvironmentOutlined,
  StarOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ShoppingOutlined
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import { useFavorite } from '@/hooks/useFavorite'
import { useAuth } from '@/hooks/useAuth'
import { addReview, setCurrentService } from '@/store/slices/serviceSlice'
import EmptyState from '@/components/Common/EmptyState'
import { timeSlots } from '@/mock/data'

const colors = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16']

const { Step } = Steps
const { RangePicker } = DatePicker
const { TextArea } = Input

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { services, technicians } = useSelector((state) => state.service)
  const { isFavorite, handleToggleFavorite } = useFavorite()
  const { isAuthenticated, currentUser } = useAuth()

  const service = services.find((s) => s.id === Number(id))
  const technician = technicians.find((t) => t.id === service?.technicianId)
  const favorited = isFavorite(Number(id))

  const [activeTab, setActiveTab] = useState('intro')
  const [bookingModalVisible, setBookingModalVisible] = useState(false)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [bookingForm] = Form.useForm()
  const [reviewForm] = Form.useForm()

  useEffect(() => {
    if (service) {
      dispatch(setCurrentService(service))
    }
  }, [service, dispatch])

  if (!service) {
    return (
      <div className="service-detail-page">
        <div className="section-container">
          <EmptyState description="服务不存在" onAction={() => navigate('/services')} actionText="返回服务列表" />
        </div>
      </div>
    )
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      message.warning('请先登录')
      navigate('/login', { state: { from: `/service/${id}` } })
      return
    }
    setBookingModalVisible(true)
  }

  const handleBookingSubmit = (values) => {
    bookingForm.validateFields().then(() => {
      setBookingModalVisible(false)
      navigate(`/booking/${id}`, { state: values })
    })
  }

  const handleReviewSubmit = () => {
    reviewForm.validateFields().then((values) => {
      const review = {
        id: Date.now(),
        user: currentUser.name,
        avatar: currentUser.avatar,
        rating: values.rating,
        content: values.content,
        time: dayjs().format('YYYY-MM-DD'),
        images: []
      }
      dispatch(addReview({ serviceId: service.id, review }))
      setReviewModalVisible(false)
      reviewForm.resetFields()
      message.success('评价成功')
    })
  }

  const priceColumns = [
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="price">¥{price}</span>
    }
  ]

  const tabButtons = [
    { key: 'intro', label: '服务介绍' },
    { key: 'process', label: '维修流程' },
    { key: 'price', label: '收费标准' },
    { key: 'reviews', label: '用户评价' }
  ]

  return (
    <div className="service-detail-page">
      <div className="section-container">
        <div className="detail-header">
          <Row gutter={24}>
            <Col span={10}>
              <div className="detail-image" style={{ backgroundColor: service.color }}>
                <span className="detail-image-text">{service.name}</span>
              </div>
            </Col>
            <Col span={14}>
              <div className="detail-info">
                <div className="detail-title">
                  <h1>{service.name}</h1>
                  <Button
                    type={favorited ? 'primary' : 'default'}
                    icon={<StarOutlined className={favorited ? 'favorited' : ''} />}
                    onClick={() => handleToggleFavorite(service)}
                  >
                    {favorited ? '已收藏' : '收藏'}
                  </Button>
                </div>

                <div className="detail-rating">
                  <Rate disabled value={service.rating} allowHalf />
                  <span className="rating-score">{service.rating}</span>
                  <span className="review-count">{service.reviewCount} 条评价</span>
                  <span className="sales-count">
                    <ShoppingOutlined /> {service.sales} 人已购买
                  </span>
                </div>

                <div className="detail-price">
                  <span className="current-price">¥{service.price}</span>
                  <span className="original-price">¥{service.originalPrice}</span>
                  <Tag color="red">限时特惠</Tag>
                </div>

                <div className="detail-features">
                  {service.features?.map((feature, index) => (
                    <Tag key={index} color="blue" icon={<CheckCircleOutlined />}>
                      {feature}
                    </Tag>
                  ))}
                </div>

                <div className="detail-shop">
                  <p>
                    <span className="label">店铺：</span>
                    {service.shopName}
                  </p>
                  <p>
                    <span className="label">
                      <EnvironmentOutlined /> 地址：
                    </span>
                    {service.address}
                  </p>
                  <p>
                    <span className="label">
                      <ClockCircleOutlined /> 距离：
                    </span>
                    {service.distance}km
                  </p>
                </div>

                {technician && (
                  <div className="detail-technician">
                    <h4>服务师傅</h4>
                    <div className="tech-info">
                      <Avatar 
                        size={48} 
                        style={{ backgroundColor: technician.color, fontSize: '20px', fontWeight: 'bold' }}
                      >
                        {technician.name.charAt(0)}
                      </Avatar>
                      <div className="tech-detail">
                        <p className="tech-name">
                          {technician.name}
                          <Tag color="green">{technician.experience}年经验</Tag>
                        </p>
                        <div className="tech-rating">
                          <Rate disabled value={technician.rating} allowHalf />
                          <span>{technician.rating}</span>
                          <span>已服务 {technician.orders} 单</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="detail-actions">
                  <Button type="primary" size="large" onClick={handleBookNow}>
                    立即预约
                  </Button>
                  <Button size="large" icon={<PhoneOutlined />}>
                    电话咨询
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <div className="detail-content">
          <div className="tab-buttons">
            {tabButtons.map((tab) => (
              <Button
                key={tab.key}
                type={activeTab === tab.key ? 'primary' : 'default'}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'intro' && (
              <Card>
                <h3>服务介绍</h3>
                <p>{service.description}</p>
                <h4>服务特色</h4>
                <ul>
                  {service.features?.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </Card>
            )}

            {activeTab === 'process' && (
              <Card>
                <h3>维修流程</h3>
                <Steps current={0} direction="vertical">
                  {service.process?.map((step) => (
                    <Step key={step.step} title={step.title} description={step.desc} />
                  ))}
                </Steps>
              </Card>
            )}

            {activeTab === 'price' && (
              <Card>
                <h3>收费标准</h3>
                <Table
                  dataSource={service.priceList}
                  columns={priceColumns}
                  pagination={false}
                  rowKey="name"
                />
                <p className="price-note">
                  * 以上价格为参考价格，具体费用以师傅上门检测后报价为准，检测不收取费用
                </p>
              </Card>
            )}

            {activeTab === 'reviews' && (
              <Card
                title={`用户评价 (${service.reviews?.length || 0})`}
                extra={
                  <Button type="primary" onClick={() => setReviewModalVisible(true)}>
                    发表评价
                  </Button>
                }
              >
                {service.reviews?.length > 0 ? (
                  <List
                    dataSource={service.reviews}
                    renderItem={(review) => (
                      <List.Item key={review.id}>
                        <List.Item.Meta
                          avatar={
                            <Avatar style={{ backgroundColor: colors[review.id % colors.length] }}>
                              {review.user.charAt(0)}
                            </Avatar>
                          }
                          title={
                            <div className="review-title">
                              <span>{review.user}</span>
                              <Rate disabled value={review.rating} allowHalf size="small" />
                              <span className="review-time">{review.time}</span>
                            </div>
                          }
                          description={review.content}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <EmptyState description="暂无评价，快来发表第一条评价吧" />
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      <Modal
        title="预约上门时间"
        open={bookingModalVisible}
        onCancel={() => setBookingModalVisible(false)}
        onOk={handleBookingSubmit}
        okText="下一步"
        width={500}
      >
        <Form form={bookingForm} layout="vertical">
          <Form.Item
            name="date"
            label="选择日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              placeholder="选择上门日期"
            />
          </Form.Item>
          <Form.Item
            name="timeSlot"
            label="选择时间段"
            rules={[{ required: true, message: '请选择时间段' }]}
          >
            <Radio.Group>
              {timeSlots.map((slot) => (
                <Radio.Button key={slot} value={slot}>
                  {slot}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="发表评价"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onOk={handleReviewSubmit}
        okText="提交评价"
        width={500}
      >
        <Form form={reviewForm} layout="vertical">
          <Form.Item
            name="rating"
            label="服务评分"
            rules={[{ required: true, message: '请评分' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="content"
            label="评价内容"
            rules={[{ required: true, message: '请输入评价内容' }]}
          >
            <TextArea rows={4} placeholder="请分享您的服务体验..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ServiceDetail
