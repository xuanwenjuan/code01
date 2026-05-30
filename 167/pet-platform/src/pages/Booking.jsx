import React, { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Form, Input, DatePicker, TimePicker, Select, Radio, Button, Card, Row, Col, Image, Space, message, Steps, Divider,
  Breadcrumb, Tag, Descriptions,
} from 'antd'
import {
  CheckCircleOutlined, ClockCircleOutlined, EnvironmentOutlined, UserOutlined, PhoneOutlined,
  HomeOutlined, AppstoreOutlined, CalendarOutlined, PayCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { createOrder } from '@/store/slices/orderSlice'
import { validatePhone, validateRequired } from '@/utils/validate'
import { formatPrice, formatDuration, formatDateTime } from '@/utils'
import PageState from '@/components/common/PageState'

const { Step } = Steps
const { Option } = Select
const { TextArea } = Input

const Booking = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(0)
  const { services } = useSelector((state) => state.service)
  const { pets } = useSelector((state) => state.pet)
  const { currentUser } = useSelector((state) => state.user)
  const [formValues, setFormValues] = useState({})

  const service = useMemo(() => {
    return services.find((s) => s.id === parseInt(serviceId))
  }, [services, serviceId])

  const userPets = useMemo(() => {
    return pets.filter((p) => p.userId === currentUser?.id)
  }, [pets, currentUser])

  const selectedPrice = useMemo(() => {
    if (service?.priceList && service.priceList[selectedPackage]) {
      return service.priceList[selectedPackage].price
    }
    return service?.price || 0
  }, [service, selectedPackage])

  const couponAmount = useMemo(() => {
    return (service?.originalPrice || 0) - selectedPrice
  }, [service, selectedPrice])

  const handleNext = async () => {
    try {
      const values = await form.validateFields()
      setFormValues(values)
      setCurrentStep(1)
    } catch (error) {
      console.log('Validation failed:', error)
    }
  }

  const handlePrev = () => {
    setCurrentStep(0)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      const selectedPet = userPets.find((p) => p.id === values.petId)
      const appointmentTime = dayjs(values.date)
        .hour(dayjs(values.time).hour())
        .minute(dayjs(values.time).minute())
        .toISOString()

      const orderData = {
        userId: currentUser.id,
        serviceId: service.id,
        serviceName: service.name,
        serviceImage: service.image,
        petId: values.petId,
        petName: selectedPet?.name,
        groomerId: service.groomerId,
        groomerName: service.groomerId ? '张小红' : null,
        appointmentTime,
        address: service.address,
        price: selectedPrice,
        originalPrice: service.originalPrice,
        coupon: couponAmount,
        totalPrice: selectedPrice,
        payMethod: values.payMethod,
        remark: values.remark,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        packageName: service.priceList?.[selectedPackage]?.name || '标准服务',
      }

      dispatch(createOrder(orderData))
      setSubmitting(false)
      setCurrentStep(2)
      message.success('预约成功！')
    } catch (error) {
      setSubmitting(false)
      console.log('Submit failed:', error)
      message.error('预约失败，请重试')
    }
  }

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day')
  }

  const handlePackageChange = (value) => {
    setSelectedPackage(value)
  }

  if (!service) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <PageState data={null} emptyText="服务不存在" />
      </div>
    )
  }

  const selectedPet = userPets.find((p) => p.id === formValues.petId)

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <Breadcrumb
            items={[
              { title: <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}><HomeOutlined /> 首页</span> },
              { title: <span onClick={() => navigate('/services')} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}><AppstoreOutlined /> 服务列表</span> },
              { title: <span onClick={() => navigate(`/service/${service.id}`)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>{service.name}</span> },
              { title: <span style={{ color: '#fff' }}>预约下单</span> },
            ]}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}
          />
          <h1 style={{ color: '#fff', fontSize: 28, margin: 0 }}>预约下单</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, marginBottom: 0 }}>
            填写预约信息，我们将尽快为您安排服务
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 40, paddingTop: 24 }}>
        <Steps current={currentStep} style={{ marginBottom: 32 }} size="large">
          <Step title="填写预约信息" description="完善服务信息" />
          <Step title="确认订单" description="核对费用明细" />
          <Step title="预约完成" description="预约成功" />
        </Steps>

        {currentStep < 2 ? (
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Card title="预约信息" style={{ marginBottom: 24, borderRadius: 12 }}>
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    contactName: currentUser?.nickname || currentUser?.username,
                    contactPhone: currentUser?.phone,
                    payMethod: 'wechat',
                    packageIndex: 0,
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="contactName"
                        label="联系人姓名"
                        rules={[{ validator: validateRequired('请输入联系人姓名') }]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="请输入联系人姓名" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="contactPhone"
                        label="联系电话"
                        rules={[{ validator: validatePhone }]}
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="请输入联系电话" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  {service.priceList && service.priceList.length > 0 && (
                    <Form.Item
                      name="packageIndex"
                      label="选择服务套餐"
                      rules={[{ validator: validateRequired('请选择服务套餐') }]}
                    >
                      <Select
                        size="large"
                        onChange={handlePackageChange}
                        placeholder="请选择服务套餐"
                      >
                        {service.priceList.map((pkg, index) => (
                          <Option key={index} value={index}>
                            {pkg.name} - {formatPrice(pkg.price)}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}

                  <Form.Item
                    name="petId"
                    label="选择服务宠物"
                    rules={[{ validator: validateRequired('请选择服务的宠物') }]}
                  >
                    <Select size="large" placeholder="请选择宠物">
                      {userPets.length > 0 ? (
                        userPets.map((pet) => (
                          <Option key={pet.id} value={pet.id}>
                            {pet.name} - {pet.breed} ({pet.gender === 'male' ? '公' : '母'}，{pet.age}岁)
                          </Option>
                        ))
                      ) : (
                        <Option value="" disabled>
                          暂无宠物，请先在"我的宠物"中添加
                        </Option>
                      )}
                    </Select>
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="date"
                        label="预约日期"
                        rules={[{ validator: validateRequired('请选择预约日期') }]}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          size="large"
                          disabledDate={disabledDate}
                          placeholder="选择服务日期"
                          format="YYYY-MM-DD"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="time"
                        label="预约时间"
                        rules={[{ validator: validateRequired('请选择预约时间') }]}
                      >
                        <TimePicker
                          style={{ width: '100%' }}
                          size="large"
                          minuteStep={30}
                          disabledTime={() => ({
                            disabledHours: () => [...Array(9).keys(), ...Array(4).keys(21, 24)],
                          })}
                          placeholder="选择服务时间"
                          format="HH:mm"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="remark" label="备注信息">
                    <TextArea
                      rows={3}
                      placeholder="如有特殊需求请在此备注，如宠物性格、注意事项等（选填）"
                      maxLength={200}
                      showCount
                      size="large"
                    />
                  </Form.Item>

                  {currentStep === 0 && (
                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                      <Button type="primary" size="large" block onClick={handleNext} style={{ height: 48, fontSize: 16 }}>
                        下一步：确认订单
                      </Button>
                    </Form.Item>
                  )}
                </Form>
              </Card>

              {currentStep === 1 && (
                <Card title="订单确认" style={{ marginBottom: 24, borderRadius: 12 }}>
                  <Descriptions column={1} bordered size="middle" style={{ marginBottom: 24 }}>
                    <Descriptions.Item label="服务名称">{service.name}</Descriptions.Item>
                    <Descriptions.Item label="服务套餐">
                      {service.priceList?.[selectedPackage]?.name || '标准服务'}
                    </Descriptions.Item>
                    <Descriptions.Item label="服务宠物">
                      {selectedPet ? `${selectedPet.name} - ${selectedPet.breed}` : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="预约时间">
                      {formValues.date && formValues.time ? (
                        formatDateTime(
                          dayjs(formValues.date)
                            .hour(dayjs(formValues.time).hour())
                            .minute(dayjs(formValues.time).minute())
                            .toISOString()
                        )
                      ) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="服务地址">{service.address}</Descriptions.Item>
                    <Descriptions.Item label="联系人">
                      {formValues.contactName} - {formValues.contactPhone}
                    </Descriptions.Item>
                    {formValues.remark && (
                      <Descriptions.Item label="备注">{formValues.remark}</Descriptions.Item>
                    )}
                  </Descriptions>

                  <Divider />

                  <Card title="支付方式" size="small" style={{ marginBottom: 24 }}>
                    <Form form={form} layout="vertical">
                      <Form.Item name="payMethod" style={{ marginBottom: 0 }}>
                        <Radio.Group size="large" style={{ width: '100%' }}>
                          <Radio.Button value="wechat" style={{ width: '33.33%', textAlign: 'center', padding: '12px 0' }}>
                            💳 微信支付
                          </Radio.Button>
                          <Radio.Button value="alipay" style={{ width: '33.33%', textAlign: 'center', padding: '12px 0' }}>
                            💳 支付宝
                          </Radio.Button>
                          <Radio.Button value="card" style={{ width: '33.33%', textAlign: 'center', padding: '12px 0' }}>
                            💳 银行卡
                          </Radio.Button>
                        </Radio.Group>
                      </Form.Item>
                    </Form>
                  </Card>

                  <Space size="large" style={{ width: '100%' }}>
                    <Button size="large" onClick={handlePrev} style={{ flex: 1, height: 48 }}>
                      上一步
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleSubmit}
                      loading={submitting}
                      icon={<PayCircleOutlined />}
                      style={{ flex: 2, height: 48, fontSize: 16 }}
                    >
                      确认预约并支付 {formatPrice(selectedPrice)}
                    </Button>
                  </Space>
                </Card>
              )}
            </Col>

            <Col xs={24} md={8}>
              <Card title="费用明细" style={{ position: 'sticky', top: 80, borderRadius: 12 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <Image
                    src={service.image}
                    width={100}
                    height={75}
                    style={{ borderRadius: 6, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }} className="text-ellipsis">
                      {service.name}
                    </div>
                    <div style={{ color: '#666', fontSize: 13 }}>
                      <EnvironmentOutlined /> {service.address}
                    </div>
                    <div style={{ color: '#666', fontSize: 13 }}>
                      <ClockCircleOutlined /> {formatDuration(service.duration)}
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ marginBottom: 12 }} className="flex-between">
                  <span style={{ color: '#666' }}>服务套餐</span>
                  <Tag color="blue">{service.priceList?.[selectedPackage]?.name || '标准服务'}</Tag>
                </div>
                <div style={{ marginBottom: 12 }} className="flex-between">
                  <span style={{ color: '#666' }}>套餐价格</span>
                  <span>{formatPrice(selectedPrice)}</span>
                </div>
                <div style={{ marginBottom: 12 }} className="flex-between">
                  <span style={{ color: '#666' }}>门市价格</span>
                  <span style={{ textDecoration: 'line-through', color: '#999' }}>
                    {formatPrice(service.originalPrice)}
                  </span>
                </div>
                {couponAmount > 0 && (
                  <div style={{ marginBottom: 12 }} className="flex-between">
                    <span style={{ color: '#666' }}>优惠金额</span>
                    <span style={{ color: '#52c41a', fontWeight: 500 }}>
                      - {formatPrice(couponAmount)}
                    </span>
                  </div>
                )}

                <Divider style={{ margin: '16px 0' }} />

                <div className="flex-between" style={{ alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>实付金额</span>
                  <span style={{ color: '#ff6b35', fontSize: 32, fontWeight: 'bold' }}>
                    {formatPrice(selectedPrice)}
                  </span>
                </div>

                <Divider style={{ margin: '20px 0' }} />

                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', fontSize: 13 }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <span>专业认证服务，品质保障</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', fontSize: 13 }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <span>服务不满意可申请退款</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', fontSize: 13 }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <span>客服热线：400-888-8888</span>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        ) : (
          <Card style={{ textAlign: 'center', padding: '60px 0', borderRadius: 12 }}>
            <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
            <h2 style={{ marginBottom: 12, fontSize: 28 }}>🎉 预约成功！</h2>
            <p style={{ color: '#666', marginBottom: 8, fontSize: 16 }}>
              您的预约已提交，我们将尽快为您确认服务时间
            </p>
            <p style={{ color: '#999', marginBottom: 32 }}>
              服务人员将在30分钟内与您电话联系确认详情
            </p>
            <Space size="large">
              <Button type="primary" size="large" onClick={() => navigate('/orders')} style={{ height: 44, padding: '0 32px' }}>
                查看我的订单
              </Button>
              <Button size="large" onClick={() => navigate('/')} style={{ height: 44, padding: '0 32px' }}>
                返回首页
              </Button>
            </Space>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Booking
