import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Row,
  Col,
  Card,
  Tag,
  Rate,
  Button,
  Space,
  List,
  Empty,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Divider,
  Steps,
  Table,
  Typography,
  Spin,
  Result,
} from 'antd'
import {
  StarOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  FireOutlined,
  CheckCircleOutlined,
  UserOutlined,
  MobileOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import ReviewCard from '@/components/ReviewCard'
import { createOrder } from '@/store/slices/orderSlice'
import { phoneRegex, nameRegex } from '@/hooks/useFormValidation'

const { Step } = Steps
const { Option } = Select
const { TextArea } = Input
const { Title, Text } = Typography

function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { services, cleaners, currentCity, loading: serviceLoading } = useSelector((state) => state.service)
  const { currentUser } = useSelector((state) => state.user)
  const { addresses } = useSelector((state) => state.address)
  const [bookingModalVisible, setBookingModalVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const service = useMemo(() => {
    return services.find((s) => s.id === Number(id))
  }, [services, id])

  const userAddresses = useMemo(() => {
    if (!currentUser) return []
    return addresses.filter((a) => a.userId === currentUser.id)
  }, [addresses, currentUser])

  const defaultAddress = useMemo(() => {
    return userAddresses.find((a) => a.isDefault) || userAddresses[0]
  }, [userAddresses])

  const availableCleaners = useMemo(() => {
    if (!service) return []
    return cleaners.filter((c) =>
      c.skills.some((skill) => service.name.includes(skill) || service.features.some((f) => f.includes(skill)))
    )
  }, [cleaners, service])

  const priceStandards = useMemo(() => {
    if (!service) return []
    return [
      {
        key: '1',
        item: service.name,
        price: `¥${service.price}`,
        unit: `/${service.unit}`,
        duration: service.duration,
        description: service.description,
      },
    ]
  }, [service])

  if (serviceLoading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <Spin size="large" tip="加载中..." />
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="page-container">
        <Result
          status="warning"
          title="服务不存在"
          subTitle="抱歉，您访问的服务已下架或不存在"
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          }
        />
      </div>
    )
  }

  const handleBook = () => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    if (defaultAddress) {
      form.setFieldsValue({
        addressId: defaultAddress.id,
        contactName: defaultAddress.contactName,
        contactPhone: defaultAddress.phone,
      })
    }
    setBookingModalVisible(true)
  }

  const handleAddressChange = (addressId) => {
    const addr = userAddresses.find((a) => a.id === addressId)
    if (addr) {
      form.setFieldsValue({
        contactName: addr.contactName,
        contactPhone: addr.phone,
      })
    }
  }

  const handleBookingSubmit = async () => {
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      const selectedCleaner = cleaners.find((c) => c.id === values.cleanerId)
      const selectedAddress = addresses.find((a) => a.id === values.addressId)

      const orderData = {
        userId: currentUser.id,
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        cleanerId: values.cleanerId,
        cleanerName: selectedCleaner?.name || '系统指派',
        addressId: values.addressId,
        address: `${selectedAddress?.province}${selectedAddress?.city}${selectedAddress?.district}${selectedAddress?.detail}`,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        appointmentTime: values.appointmentTime.format('YYYY-MM-DD HH:mm'),
        totalPrice: service.price,
        remark: values.remark,
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      dispatch(createOrder(orderData))
      message.success('预约成功！请在订单中心查看')
      setBookingModalVisible(false)
      form.resetFields()
      navigate('/user/orders')
    } catch (error) {
      if (error?.errorFields) {
        message.warning('请完善预约信息')
      } else {
        message.error('预约失败，请稍后重试')
        console.error('预约失败:', error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day')
  }

  const disabledTime = () => {
    return {
      disabledHours: () => [...Array(8).keys(), ...Array(3).keys()].map((i) => i + 21),
    }
  }

  const priceColumns = [
    {
      title: '服务项目',
      dataIndex: 'item',
      key: 'item',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '服务时长',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        <Space>
          <Text strong type="danger" style={{ fontSize: 16 }}>{price}</Text>
          <Text type="secondary">{record.unit}</Text>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="page-container" style={{ marginBottom: 24 }}>
        <Row gutter={[32, 24]}>
          <Col xs={24} lg={12}>
            <div
              style={{
                width: '100%',
                height: 400,
                borderRadius: 12,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={service.image}
                alt={service.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Tag
                color="blue"
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  fontSize: 14,
                  padding: '4px 12px',
                }}
              >
                <FireOutlined /> {currentCity}可服务
              </Tag>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color="blue">{service.category}</Tag>
                <Tag color="orange">
                  <ClockCircleOutlined /> 约{service.duration}
                </Tag>
              </Space>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>{service.name}</h1>
            <div style={{ marginBottom: 16 }}>
              <Space size={16}>
                <Space>
                  <Rate disabled defaultValue={service.rating} style={{ fontSize: 14 }} />
                  <span style={{ color: '#faad14', fontWeight: 600 }}>{service.rating}</span>
                </Space>
                <Space style={{ color: '#999' }}>
                  <EyeOutlined /> {service.sales}人购买
                </Space>
                <Space style={{ color: '#999' }}>
                  <StarOutlined /> 已有{service.reviews.length}条评价
                </Space>
              </Space>
            </div>
            <p style={{ color: '#666', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              {service.description}
            </p>
            <div
              style={{
                background: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)',
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <Text type="secondary">限时特惠</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <span style={{ color: '#ff4d4f', fontSize: 42, fontWeight: 700 }}>
                  ¥{service.price}
                </span>
                <span style={{ color: '#999', fontSize: 16, textDecoration: 'line-through' }}>
                  ¥{Math.round(service.price * 1.3)}
                </span>
                <Tag color="red" style={{ marginLeft: 8 }}>
                  已省¥{Math.round(service.price * 0.3)}
                </Tag>
              </div>
              <Space wrap>
                {service.features.map((feature, index) => (
                  <Tag key={index} color="success" icon={<CheckCircleOutlined />}>
                    {feature}
                  </Tag>
                ))}
              </Space>
            </div>
            <Space size={16}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={handleBook}
                style={{ height: 48, padding: '0 48px', fontSize: 16, borderRadius: 24 }}
              >
                立即预约
              </Button>
              <Button
                size="large"
                style={{ height: 48, padding: '0 32px', borderRadius: 24 }}
                onClick={() => navigate('/')}
              >
                返回首页
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <div className="page-container" style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FireOutlined style={{ color: '#ff4d4f' }} />
          收费标准
        </Title>
        <Table
          dataSource={priceStandards}
          columns={priceColumns}
          pagination={false}
          bordered
          size="middle"
        />
        <div style={{ marginTop: 16, padding: 16, background: '#f6ffed', borderRadius: 8 }}>
          <Text type="success">
            <CheckCircleOutlined /> 费用说明：包含专业保洁师服务、清洁工具、环保清洁剂，无隐藏消费
          </Text>
        </div>
      </div>

      <div className="page-container" style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          服务标准
        </Title>
        <List
          dataSource={service.standards}
          renderItem={(item) => (
            <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: '#e6f7ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1890ff',
                      fontWeight: 600,
                    }}
                  >
                    {item.item.charAt(0)}
                  </div>
                }
                title={<Text strong>{item.item}</Text>}
                description={<Text style={{ color: '#666' }}>{item.content}</Text>}
              />
            </List.Item>
          )}
        />
      </div>

      {availableCleaners.length > 0 && (
        <div className="page-container" style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarOutlined style={{ color: '#faad14' }} />
            推荐保洁师
          </Title>
          <Row gutter={[24, 24]}>
            {availableCleaners.slice(0, 3).map((cleaner) => (
              <Col xs={24} md={12} lg={8} key={cleaner.id}>
                <Card className="card-hover" bodyStyle={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img
                      src={cleaner.avatar}
                      alt={cleaner.name}
                      style={{ width: 60, height: 60, borderRadius: '50%' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 16 }}>{cleaner.name}</div>
                      <Space size={4} style={{ marginBottom: 4 }}>
                        <Rate disabled defaultValue={cleaner.rating} style={{ fontSize: 12 }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {cleaner.rating}分
                        </Text>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        已服务{cleaner.orderCount}单
                      </Text>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Space size={[4, 4]} wrap>
                      {cleaner.skills.slice(0, 3).map((skill, index) => (
                        <Tag key={index} color="green" style={{ margin: 0 }}>
                          {skill}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <div className="page-container">
        <Title level={4} style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarOutlined style={{ color: '#faad14' }} />
          用户评价
          <Tag style={{ marginLeft: 8 }}>{service.reviews.length}条</Tag>
        </Title>
        {service.reviews && service.reviews.length > 0 ? (
          <div>
            {service.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <Empty description="暂无评价" className="empty-state" />
        )}
      </div>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingOutlined style={{ color: '#1890ff' }} />
            预约服务
          </div>
        }
        open={bookingModalVisible}
        onCancel={() => setBookingModalVisible(false)}
        onOk={handleBookingSubmit}
        okText="确认预约"
        cancelText="取消"
        width={680}
        okButtonProps={{ loading: submitting, style: { height: 40, padding: '0 32px' } }}
        confirmLoading={submitting}
        maskClosable={!submitting}
      >
        <Form form={form} layout="vertical">
          <Steps current={0} size="small" style={{ marginBottom: 32 }}>
            <Step title="填写信息" />
            <Step title="选择时间" />
            <Step title="确认订单" />
          </Steps>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="addressId"
                label={
                  <span>
                    <HomeOutlined style={{ marginRight: 4 }} />
                    服务地址
                  </span>
                }
                rules={[{ required: true, message: '请选择服务地址' }]}
              >
                <Select
                  placeholder="请选择服务地址"
                  onChange={handleAddressChange}
                  allowClear
                >
                  {userAddresses.map((addr) => (
                    <Option key={addr.id} value={addr.id}>
                      <Space>
                        <EnvironmentOutlined />
                        {addr.province} {addr.city} {addr.district} {addr.detail}
                        {addr.isDefault && <Tag color="blue">默认</Tag>}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="appointmentTime"
                label={
                  <span>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    预约时间
                  </span>
                }
                rules={[{ required: true, message: '请选择预约时间' }]}
              >
                <DatePicker
                  showTime={{
                    format: 'HH:mm',
                    hourStep: 1,
                    minuteStep: 30,
                  }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  disabledTime={disabledTime}
                  placeholder="选择上门时间"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="contactName"
                label={
                  <span>
                    <UserOutlined style={{ marginRight: 4 }} />
                    联系人姓名
                  </span>
                }
                rules={[
                  { required: true, message: '请输入联系人姓名' },
                  { pattern: nameRegex, message: '姓名2-20位，支持中英文数字' },
                ]}
              >
                <Input placeholder="请输入联系人姓名" size="large" maxLength={20} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="contactPhone"
                label={
                  <span>
                    <MobileOutlined style={{ marginRight: 4 }} />
                    联系电话
                  </span>
                }
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: phoneRegex, message: '请输入正确的11位手机号' },
                ]}
              >
                <Input placeholder="请输入11位手机号" size="large" maxLength={11} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24}>
              <Form.Item
                name="cleanerId"
                label={
                  <span>
                    <UserOutlined style={{ marginRight: 4 }} />
                    选择保洁师（可选）
                  </span>
                }
              >
                <Select placeholder="系统将为您自动匹配优质保洁师" allowClear size="large">
                  {availableCleaners.map((cleaner) => (
                    <Option key={cleaner.id} value={cleaner.id}>
                      <Space>
                        {cleaner.name}
                        <Rate disabled defaultValue={cleaner.rating} style={{ fontSize: 12 }} />
                        <span style={{ color: '#999' }}>({cleaner.orderCount}单)</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remark"
            label="备注信息（选填）"
          >
            <TextArea
              rows={3}
              placeholder="如有特殊要求请备注，如：需要自带清洁工具、有宠物等"
              maxLength={200}
              showCount
              size="large"
            />
          </Form.Item>

          <Divider style={{ margin: '16px 0' }} />
          
          <Card
            style={{ background: '#fafafa', border: '1px dashed #d9d9d9' }}
            bodyStyle={{ padding: 16 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary">服务项目：</Text>
                <Text strong>{service.name}</Text>
                <br />
                <Text type="secondary">服务时长：</Text>
                <Text>约{service.duration}</Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text type="secondary">合计金额</Text>
                <div>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#ff4d4f' }}>¥{service.price}</span>
                </div>
              </div>
            </div>
          </Card>
        </Form>
      </Modal>
    </div>
  )
}

export default ServiceDetail
