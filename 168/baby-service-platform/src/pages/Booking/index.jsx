import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Row, Col, Card, Form, Input, DatePicker, Select, Button,
  Descriptions, Avatar, message, Steps, Tag, Divider
} from 'antd'
import {
  EnvironmentOutlined, UserOutlined, PhoneOutlined,
  CalendarOutlined, CheckCircleOutlined,
  FileTextOutlined, CreditCardOutlined, SmileOutlined
} from '@ant-design/icons'
import { createOrder } from '@/store/slices/orderSlice'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/utils'
import { formRules } from '@/utils/regex'

const { Step } = Steps
const { Option } = Select
const { TextArea } = Input

const Booking = () => {
  const { serviceId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser } = useAuth()
  const { services } = useSelector(state => state.service)
  const { babies } = useSelector(state => state.baby)
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)

  const cycle = searchParams.get('cycle')
  const service = services.find(s => s.id === Number(serviceId))

  const selectedCycle = useMemo(() => {
    if (cycle) return decodeURIComponent(cycle)
    if (service?.serviceCycle?.length > 0) return service.serviceCycle[0]
    return ''
  }, [cycle, service])

  if (!service) {
    navigate('/services')
    return null
  }

  const handleSubmit = async (values) => {
    const baby = babies.find(b => b.id === values.babyId)
    const orderData = {
      serviceId: service.id,
      serviceName: service.name,
      serviceImage: service.image,
      price: service.price,
      serviceTime: values.serviceTime.format('YYYY-MM-DD'),
      serviceCycle: selectedCycle,
      babyId: values.babyId,
      babyName: baby?.name || '',
      address: values.address,
      phone: values.phone,
      remark: values.remark,
      userId: currentUser.id
    }

    dispatch(createOrder(orderData))
    message.success('预约成功！')
    setCurrentStep(2)
  }

  const handleNext = () => {
    form.validateFields().then(() => {
      setCurrentStep(1)
    }).catch(() => {
      message.warning('请完善预约信息')
    })
  }

  const handlePrev = () => {
    setCurrentStep(0)
  }

  const steps = [
    { title: '填写预约信息', icon: <FileTextOutlined /> },
    { title: '确认订单', icon: <CreditCardOutlined /> },
    { title: '预约成功', icon: <CheckCircleOutlined /> }
  ]

  const SectionTitle = ({ title, children }) => (
    <>
      <div className="section-title-wrapper">
        <div className="section-title-icon" />
        <h3 className="section-title-text">{title}</h3>
      </div>
      {children}
    </>
  )

  const FormItemWrapper = ({ label, required, children }) => (
    <Form.Item
      label={<span style={{ fontWeight: 500, color: '#333' }}>{label}</span>}
      required={required}
    >
      {children}
    </Form.Item>
  )

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>预约服务</h1>
          <p>请填写预约信息，我们将尽快为您安排服务</p>
        </div>
      </div>

      <div className="container page-content">
        <Card className="card-shadow" style={{ marginBottom: 24 }}>
          <div style={{ padding: '20px 0 40px' }}>
            <Steps current={currentStep} items={steps} />
          </div>

          {currentStep === 0 && (
            <Row gutter={24}>
              <Col xs={24} md={14}>
                <Form
                  form={form}
                  layout="vertical"
                  size="large"
                  initialValues={{
                    phone: currentUser?.phone,
                    address: currentUser?.address
                  }}
                >
                  <Card className="booking-card" title="服务信息">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="服务名称">{service.name}</Descriptions.Item>
                      <Descriptions.Item label="服务周期">{selectedCycle}</Descriptions.Item>
                      <Descriptions.Item label="服务价格">
                        <span className="price-text" style={{ fontSize: 18, fontWeight: 700 }}>
                          {formatPrice(service.price)}
                        </span>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card className="booking-card" title="预约信息">
                    <FormItemWrapper label="服务时间" required>
                      <Form.Item
                        name="serviceTime"
                        rules={[{ required: true, message: '请选择服务时间' }]}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          placeholder="请选择服务时间"
                          disabledDate={(current) => current && current < Date.now()}
                          size="large"
                        />
                      </Form.Item>
                    </FormItemWrapper>

                    <FormItemWrapper label="选择宝宝" required>
                      <Form.Item
                        name="babyId"
                        rules={[{ required: true, message: '请选择宝宝' }]}
                      >
                        <Select placeholder="请选择宝宝" size="large">
                          {babies.map(baby => (
                            <Option key={baby.id} value={baby.id}>
                              {baby.name} ({baby.gender === 'boy' ? '男' : '女'}宝)
                            </Option>
                          ))}
                          <Option value="new" disabled>
                            + 添加宝宝信息（请到个人中心添加）
                          </Option>
                        </Select>
                      </Form.Item>
                    </FormItemWrapper>

                    <FormItemWrapper label="联系电话" required>
                      <Form.Item
                        name="phone"
                        rules={formRules.phone}
                      >
                        <Input
                          prefix={<PhoneOutlined style={{ color: '#999' }} />}
                          placeholder="请输入联系电话"
                          size="large"
                        />
                      </Form.Item>
                    </FormItemWrapper>

                    <FormItemWrapper label="服务地址" required>
                      <Form.Item
                        name="address"
                        rules={[{ required: true, message: '请输入服务地址' }]}
                      >
                        <Input
                          prefix={<EnvironmentOutlined style={{ color: '#999' }} />}
                          placeholder="请输入详细服务地址"
                          size="large"
                        />
                      </Form.Item>
                    </FormItemWrapper>

                    <FormItemWrapper label="备注信息">
                      <Form.Item name="remark">
                        <TextArea
                          rows={4}
                          placeholder="请输入备注信息（选填）"
                          maxLength={200}
                          showCount
                          size="large"
                        />
                      </Form.Item>
                    </FormItemWrapper>
                  </Card>

                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={handleNext}
                    style={{ height: 48, fontSize: 16 }}
                  >
                    下一步
                  </Button>
                </Form>
              </Col>

              <Col xs={24} md={10}>
                <Card className="card-shadow service-info-card">
                  <h3 style={{ fontSize: 16, marginBottom: 16, fontWeight: 600 }}>费用预览</h3>
                  <div style={{ marginBottom: 16 }}>
                    <img
                      src={service.image}
                      alt={service.name}
                      style={{
                        width: '100%',
                        height: 160,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginBottom: 12
                      }}
                    />
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{service.name}</div>
                    <div style={{ color: '#999', fontSize: 13 }}>{service.category} · {selectedCycle}</div>
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  <div className="price-summary-card">
                    {service.priceDetail?.map((item, index) => (
                      <div key={index} className="price-item">
                        <span>{item.item}</span>
                        <span>{formatPrice(item.price)}</span>
                      </div>
                    ))}
                    <div className="price-total">
                      <span className="price-total-label">合计：</span>
                      <span className="price-total-value">{formatPrice(service.price)}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, padding: 12, background: '#fffbe6', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#d4b106', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <SmileOutlined />
                      <span>预约成功后，客服将在2小时内与您联系确认</span>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {currentStep === 1 && (
            <div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                textAlign: 'center',
                marginBottom: 32,
                color: '#333'
              }}>
                请确认订单信息
              </h3>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Card className="booking-card" title="服务信息">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="服务名称">{service.name}</Descriptions.Item>
                      <Descriptions.Item label="服务周期">{selectedCycle}</Descriptions.Item>
                      <Descriptions.Item label="服务时间">
                        <Tag color="blue">{form.getFieldValue('serviceTime')?.format('YYYY-MM-DD')}</Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card className="booking-card" title="联系信息">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="联系电话">
                        <span style={{ color: '#333' }}>{form.getFieldValue('phone')}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="服务地址">
                        <span style={{ color: '#333' }}>{form.getFieldValue('address')}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="备注">
                        <span style={{ color: '#666' }}>{form.getFieldValue('remark') || '无'}</span>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card className="booking-card" title="费用明细">
                    {service.priceDetail?.map((item, index) => (
                      <div key={index} className="price-item">
                        <span>{item.item}</span>
                        <span>{formatPrice(item.price)}</span>
                      </div>
                    ))}
                    <div className="price-total">
                      <span className="price-total-label">应付金额：</span>
                      <span className="price-total-value">{formatPrice(service.price)}</span>
                    </div>
                  </Card>
                </Col>
              </Row>

              <div style={{ display: 'flex', gap: 16, marginTop: 32, justifyContent: 'center' }}>
                <Button size="large" onClick={handlePrev} style={{ padding: '0 32px', height: 44 }}>
                  上一步
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => form.submit()}
                  style={{ padding: '0 48px', height: 44, fontSize: 16 }}
                >
                  提交预约
                </Button>
              </div>

              <Form form={form} onFinish={handleSubmit} style={{ display: 'none' }}>
                <Button htmlType="submit" id="hiddenSubmit" />
              </Form>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-container step-success">
              <div className="step-success-icon">🎉</div>
              <h2 className="step-success-title">预约成功！</h2>
              <p className="step-success-desc">
                我们的客服将在2小时内与您联系确认订单
              </p>
              <div style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: 8,
                padding: 16,
                maxWidth: 400,
                margin: '0 auto 24px'
              }}>
                <div style={{ color: '#52c41a', fontWeight: 500, marginBottom: 8 }}>
                  预约信息已发送至您的手机
                </div>
                <div style={{ color: '#666', fontSize: 13 }}>
                  服务：{service.name}<br />
                  时间：{form.getFieldValue('serviceTime')?.format('YYYY-MM-DD')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <Button size="large" onClick={() => navigate('/')} style={{ padding: '0 32px', height: 44 }}>
                  返回首页
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/profile/orders')}
                  style={{ padding: '0 32px', height: 44 }}
                >
                  查看订单
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Booking
