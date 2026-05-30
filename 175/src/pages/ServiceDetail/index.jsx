import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Row,
  Col,
  Card,
  Tag,
  Rate,
  Button,
  Table,
  DatePicker,
  TimePicker,
  Input,
  Form,
  Radio,
  message,
  Descriptions,
  Divider
} from 'antd'
import {
  ShoppingCartOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PhoneOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { setCurrentService } from '@/store/slices/serviceSlice'
import { addOrder } from '@/store/slices/orderSlice'
import { useAuth } from '@/hooks/useAuth'
import { validationRules } from '@/hooks/useFormValidation'
import Loading from '@/components/Loading'

const { TextArea } = Input

function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userInfo, isLoggedIn } = useAuth()
  const { services, currentService } = useSelector((state) => state.service)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [isEmergency, setIsEmergency] = useState(false)

  const service = currentService || services.find((s) => s.id === parseInt(id))

  useEffect(() => {
    if (!service) {
      const found = services.find((s) => s.id === parseInt(id))
      if (found) {
        dispatch(setCurrentService(found))
      }
    }
    setTimeout(() => setLoading(false), 300)
  }, [id, service, services, dispatch])

  if (loading) return <Loading />
  if (!service) return <div style={{ padding: 50, textAlign: 'center' }}>服务不存在</div>

  const priceColumns = [
    {
      title: '服务项目',
      dataIndex: 'item',
      key: 'item'
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="text-danger" style={{ fontWeight: 'bold' }}>¥{price}</span>
    },
    {
      title: '说明',
      dataIndex: 'desc',
      key: 'desc'
    }
  ]

  const handleSubmit = async (values) => {
    if (!isLoggedIn) {
      message.warning('请先登录后再预约')
      navigate('/login', { state: { from: `/service/${id}` } })
      return
    }

    const appointmentDate = values.date.format('YYYY-MM-DD')
    const appointmentTime = values.time.format('HH:mm')
    const appointmentDateTime = `${appointmentDate} ${appointmentTime}-${values.time.add(2, 'hour').format('HH:mm')}`

    const orderData = {
      serviceId: service.id,
      serviceName: service.name,
      serviceImage: service.image,
      userId: userInfo.id,
      userName: values.userName,
      userPhone: values.userPhone,
      address: values.address,
      appointmentTime: appointmentDateTime,
      price: isEmergency ? service.emergencyPrice : service.price,
      isEmergency,
      remark: values.remark,
      statusText: '待接单'
    }

    dispatch(addOrder(orderData))
    message.success('预约成功！师傅将尽快联系您')
    navigate('/orders')
  }

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day')
  }

  return (
    <div className="container">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="mb-24">
            <Row gutter={24}>
              <Col xs={24} md={10}>
                <img
                  src={service.image}
                  alt={service.name}
                  style={{ width: '100%', borderRadius: 8 }}
                />
              </Col>
              <Col xs={24} md={14}>
                <div style={{ marginBottom: 16 }}>
                  <Tag color="blue" style={{ marginBottom: 8 }}>
                    {service.category}
                  </Tag>
                  <h1 style={{ fontSize: 28, marginBottom: 8 }}>{service.name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <Rate disabled value={service.rating} allowHalf />
                    <span>{service.rating} 分</span>
                    <span>已售 {service.orderCount} 单</span>
                  </div>
                  <p style={{ color: '#666', fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
                    {service.description}
                  </p>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    {service.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircleOutlined className="text-success" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                    <div>
                      <span className="price-tag">¥{service.price}</span>
                      <span style={{ color: '#999' }}>/{service.unit}</span>
                    </div>
                    <div style={{ color: '#999' }}>
                      紧急价：<span className="text-danger">¥{service.emergencyPrice}</span>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          <Card title="服务介绍" className="mb-24">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="服务名称">{service.name}</Descriptions.Item>
              <Descriptions.Item label="服务分类">{service.category}</Descriptions.Item>
              <Descriptions.Item label="服务价格">¥{service.price}/{service.unit}</Descriptions.Item>
              <Descriptions.Item label="紧急价格">¥{service.emergencyPrice}/{service.unit}</Descriptions.Item>
              <Descriptions.Item label="服务保障">{service.warranty}质保</Descriptions.Item>
              <Descriptions.Item label="服务评分">{service.rating}分</Descriptions.Item>
            </Descriptions>
            <Divider />
            <p style={{ lineHeight: 1.8, color: '#666' }}>{service.description}</p>
          </Card>

          <Card title="收费标准" className="mb-24">
            <Table
              columns={priceColumns}
              dataSource={service.priceList}
              rowKey="item"
              pagination={false}
            />
          </Card>

          <Card title="服务优势">
            <Row gutter={[16, 16]}>
              <Col xs={12} md={6}>
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <ClockCircleOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  <h3 style={{ marginTop: 12 }}>30分钟上门</h3>
                  <p style={{ color: '#666' }}>快速响应，准时到达</p>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                  <h3 style={{ marginTop: 12 }}>不通不收费</h3>
                  <p style={{ color: '#666' }}>效果保障，满意付款</p>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <SafetyOutlined style={{ fontSize: 48, color: '#faad14' }} />
                  <h3 style={{ marginTop: 12 }}>售后保障</h3>
                  <p style={{ color: '#666' }}>{service.warranty}免费保修</p>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <ThunderboltOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
                  <h3 style={{ marginTop: 12 }}>24小时服务</h3>
                  <p style={{ color: '#666' }}>全天候，随时待命</p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="立即预约" className="card-hover">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                date: dayjs(),
                time: dayjs().hour(8).minute(0)
              }}
            >
              <Form.Item label="服务类型">
                <Radio.Group value={isEmergency} onChange={(e) => setIsEmergency(e.target.value)}>
                  <Radio.Button value={false}>普通预约</Radio.Button>
                  <Radio.Button value={true} style={{ color: '#ff4d4f', borderColor: '#ff4d4f' }}>
                    <ThunderboltOutlined /> 紧急疏通
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="userName"
                label="联系人姓名"
                rules={[
                  { required: true, message: '请输入联系人姓名' },
                  {
                    validator: (_, value) => {
                      if (value && validationRules.name.pattern.test(value)) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error(validationRules.name.message))
                    }
                  }
                ]}
                initialValue={userInfo?.name || ''}
              >
                <Input placeholder="请输入您的姓名" />
              </Form.Item>

              <Form.Item
                name="userPhone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  {
                    validator: (_, value) => {
                      if (value && validationRules.phone.pattern.test(value)) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error(validationRules.phone.message))
                    }
                  }
                ]}
                initialValue={userInfo?.phone || ''}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="请输入11位手机号码"
                  maxLength={11}
                />
              </Form.Item>

              <Form.Item
                name="date"
                label="预约日期"
                rules={[{ required: true, message: '请选择预约日期' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  placeholder="选择日期"
                />
              </Form.Item>

              <Form.Item
                name="time"
                label="预约时间"
                rules={[{ required: true, message: '请选择预约时间' }]}
              >
                <TimePicker
                  style={{ width: '100%' }}
                  minuteStep={60}
                  format="HH:mm"
                  placeholder="选择时间"
                />
              </Form.Item>

              <Form.Item
                name="address"
                label="服务地址"
                rules={[
                  { required: true, message: '请输入服务地址' },
                  { min: 5, message: '地址至少5个字符' }
                ]}
              >
                <Input placeholder="请输入详细地址，如：北京市朝阳区XX小区XX号楼XX单元XX室" />
              </Form.Item>

              <Form.Item name="remark" label="问题描述">
                <TextArea rows={3} placeholder="请描述您遇到的问题（选填）" />
              </Form.Item>

              <Divider />

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>服务费用</span>
                  <span className="price-tag">¥{isEmergency ? service.emergencyPrice : service.price}</span>
                </div>
                {isEmergency && (
                  <div style={{ color: '#faad14', fontSize: 12 }}>
                    * 紧急疏通将在30分钟内安排师傅上门
                  </div>
                )}
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  block
                  htmlType="submit"
                  icon={<ShoppingCartOutlined />}
                  danger={isEmergency}
                >
                  {isEmergency ? '立即紧急预约' : '立即预约'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ServiceDetail
