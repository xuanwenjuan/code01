import React, { useState, useMemo } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Radio,
  DatePicker,
  Row,
  Col,
  Steps,
  Descriptions,
  Tag,
  Space,
  Divider,
  Table,
  Result,
  message
} from 'antd'
import {
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  HomeOutlined
} from '@ant-design/icons'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import { createOrder } from '@/store/slices/orderSlice'
import { timeSlots } from '@/mock/data'
import { useAuth } from '@/hooks/useAuth'

const { Step } = Steps
const { Option } = Select
const { TextArea } = Input

const Booking = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { services } = useSelector((state) => state.service)
  const { addresses, currentUser } = useSelector((state) => state.user)
  const { orders } = useSelector((state) => state.order)

  const service = services.find((s) => s.id === Number(id))
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const [bookingData, setBookingData] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)

  const initialDate = location.state?.date
  const initialTimeSlot = location.state?.timeSlot

  const steps = [
    { title: '填写预约信息' },
    { title: '确认预约信息' },
    { title: '提交完成' }
  ]

  const handleNext = () => {
    form.validateFields().then((values) => {
      setBookingData(values)
      setCurrentStep(1)
    })
  }

  const handlePrev = () => {
    setCurrentStep(0)
  }

  const handleSubmit = () => {
    const orderData = {
      ...bookingData,
      serviceId: service.id,
      serviceName: service.name,
      serviceColor: service.color,
      shopName: service.shopName,
      price: service.price,
      originalPrice: service.originalPrice,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      date: bookingData.date.format('YYYY-MM-DD'),
      status: 'pending'
    }

    dispatch(createOrder(orderData))
    setCurrentStep(2)
    message.success('预约提交成功！')
  }

  const handleViewOrders = () => {
    navigate('/orders')
  }

  const priceBreakdown = useMemo(() => {
    if (!service) return []
    const items = [
      { name: '基础服务费', price: service.price },
      { name: '上门费', price: 0 },
      { name: '检测费', price: 0 }
    ]
    const total = items.reduce((sum, item) => sum + item.price, 0)
    return { items, total }
  }, [service])

  const priceColumns = [
    { title: '项目', dataIndex: 'name', key: 'name' },
    {
      title: '金额',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (price === 0 ? '免费' : `¥${price}`)
    }
  ]

  if (!service) {
    return null
  }

  return (
    <div className="booking-page">
      <div className="section-container">
        <div className="page-header">
          <h1 className="page-title">预约下单</h1>
        </div>

        <Steps current={currentStep} items={steps} className="booking-steps" />

        {currentStep === 0 && (
          <Row gutter={24}>
            <Col span={16}>
              <Card title="填写预约信息" className="form-card">
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    date: initialDate || null,
                    timeSlot: initialTimeSlot || null,
                    address: selectedAddress?.id || null
                  }}
                >
                  <h3 className="form-section-title">
                    <CalendarOutlined /> 预约时间
                  </h3>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="date"
                        label="选择日期"
                        rules={[{ required: true, message: '请选择日期' }]}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          disabledDate={(current) =>
                            current && current < dayjs().startOf('day')
                          }
                          placeholder="选择上门日期"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="timeSlot"
                        label="选择时间段"
                        rules={[{ required: true, message: '请选择时间段' }]}
                      >
                        <Radio.Group style={{ width: '100%' }}>
                          {timeSlots.map((slot) => (
                            <Radio.Button key={slot} value={slot}>
                              {slot}
                            </Radio.Button>
                          ))}
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />

                  <h3 className="form-section-title">
                    <UserOutlined /> 联系人信息
                  </h3>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="contactName"
                        label="联系人姓名"
                        rules={[
                          { required: true, message: '请输入联系人姓名' },
                          { pattern: /^[\u4e00-\u9fa5a-zA-Z]{2,}$/, message: '请输入正确的姓名' }
                        ]}
                      >
                        <Input placeholder="请输入联系人姓名" prefix={<UserOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="contactPhone"
                        label="联系电话"
                        rules={[
                          { required: true, message: '请输入联系电话' },
                          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                        ]}
                      >
                        <Input placeholder="请输入联系电话" prefix={<PhoneOutlined />} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />

                  <h3 className="form-section-title">
                    <HomeOutlined /> 服务地址
                  </h3>
                  {addresses.length > 0 ? (
                    <Form.Item
                      name="address"
                      rules={[{ required: true, message: '请选择服务地址' }]}
                    >
                      <Radio.Group onChange={(e) => setSelectedAddress(e.target.value)}>
                        {addresses.map((addr) => (
                          <Radio.Button key={addr.id} value={addr} className="address-option">
                            <div className="address-info">
                              <p className="address-contact">
                                {addr.name} {addr.phone}
                                {addr.isDefault && <Tag color="blue">默认</Tag>}
                              </p>
                              <p className="address-detail">
                                <EnvironmentOutlined /> {addr.province} {addr.city} {addr.district}{' '}
                                {addr.detail}
                              </p>
                            </div>
                          </Radio.Button>
                        ))}
                      </Radio.Group>
                    </Form.Item>
                  ) : (
                    <p className="no-address-tip">
                      暂无常用地址，请先
                      <Button type="link" onClick={() => navigate('/address')}>
                        添加地址
                      </Button>
                    </p>
                  )}
                  <Button
                    type="dashed"
                    block
                    onClick={() => navigate('/address')}
                    style={{ marginBottom: 16 }}
                  >
                    + 添加新地址
                  </Button>

                  <Divider />

                  <h3 className="form-section-title">
                    <ClockCircleOutlined /> 故障描述
                  </h3>
                  <Form.Item
                    name="description"
                    rules={[
                      { required: true, message: '请描述家电故障情况' },
                      { min: 10, message: '至少输入10个字符' }
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="请详细描述家电故障情况，如：空调不制冷，开机有异响等..."
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" size="large" block onClick={handleNext}>
                      下一步
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col span={8}>
              <Card title="服务信息" className="info-card">
                <div className="service-summary">
                  <div className="service-thumb" style={{ backgroundColor: service.color }}>
                    {service.name.charAt(0)}
                  </div>
                  <div className="service-info">
                    <h3>{service.name}</h3>
                    <p className="shop-name">{service.shopName}</p>
                    <div className="price">
                      <span className="current">¥{service.price}</span>
                      <span className="original">¥{service.originalPrice}</span>
                    </div>
                  </div>
                </div>
                <Divider />
                <div className="service-features">
                  {service.features?.map((feature, index) => (
                    <p key={index}>
                      <CheckCircleOutlined /> {feature}
                    </p>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {currentStep === 1 && bookingData && (
          <Card title="确认预约信息" className="confirm-card">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="服务名称">{service.name}</Descriptions.Item>
              <Descriptions.Item label="服务店铺">{service.shopName}</Descriptions.Item>
              <Descriptions.Item label="预约日期">
                {bookingData.date.format('YYYY-MM-DD')}
              </Descriptions.Item>
              <Descriptions.Item label="预约时间">{bookingData.timeSlot}</Descriptions.Item>
              <Descriptions.Item label="联系人">{bookingData.contactName}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{bookingData.contactPhone}</Descriptions.Item>
              <Descriptions.Item label="服务地址" span={2}>
                {bookingData.address?.province} {bookingData.address?.city}{' '}
                {bookingData.address?.district} {bookingData.address?.detail}
              </Descriptions.Item>
              <Descriptions.Item label="故障描述" span={2}>
                {bookingData.description}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3>费用明细</h3>
            <Table
              dataSource={priceBreakdown.items}
              columns={priceColumns}
              pagination={false}
              rowKey="name"
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>总计</Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong className="total-price">¥{priceBreakdown.total}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
            <p className="price-note">
              * 以上价格为参考价格，具体费用以师傅上门检测后报价为准，检测不收取费用
            </p>

            <div className="confirm-actions">
              <Button size="large" onClick={handlePrev}>
                上一步
              </Button>
              <Button type="primary" size="large" onClick={handleSubmit}>
                提交预约
              </Button>
            </div>
          </Card>
        )}

        {currentStep === 2 && (
          <Result
            status="success"
            title="预约提交成功！"
            subTitle="我们的维修师傅将在预约时间联系您，请保持电话畅通"
            extra={[
              <Button type="primary" key="orders" onClick={handleViewOrders}>
                查看我的订单
              </Button>,
              <Button key="home" onClick={() => navigate('/')}>
                返回首页
              </Button>
            ]}
          />
        )}
      </div>
    </div>
  )
}

export default Booking
