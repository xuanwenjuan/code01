import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Button,
  InputNumber,
  message,
  Steps,
  Result,
  Space,
  Divider,
  Modal,
  List,
  Avatar,
  Row,
  Col
} from 'antd'
import {
  EnvironmentOutlined,
  PlusOutlined,
  UserOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { validatePhone, validateName } from '@/utils/validation'
import { addAddress, updateAddress } from '@/store/slices/userSlice'
import { createOrder } from '@/store/slices/orderSlice'
import './style.css'

const { Step } = Steps

const Booking = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentBooking } = useSelector(state => state.order)
  const { addresses } = useSelector(state => state.user)
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [addressModalVisible, setAddressModalVisible] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressForm] = Form.useForm()

  if (!currentBooking) {
    navigate('/services')
    return null
  }

  const selectedAddress = addresses.find(addr => addr.isDefault) || addresses[0]

  const handleNextStep = async () => {
    try {
      await form.validateFields()
      setCurrentStep(1)
    } catch (error) {
      message.warning('请完善预约信息')
    }
  }

  const handleSubmitOrder = () => {
    const values = form.getFieldsValue()
    const appointmentTime = `${values.date.format('YYYY-MM-DD')} ${values.time.format('HH:mm')}`

    const orderData = {
      ...currentBooking,
      appointmentTime,
      address: selectedAddress
        ? `${selectedAddress.province}${selectedAddress.city}${selectedAddress.district}${selectedAddress.detail}`
        : values.address,
      contactName: values.name || (selectedAddress?.name),
      contactPhone: values.phone || (selectedAddress?.phone),
      remark: values.remark,
      price: currentBooking.totalPrice
    }

    dispatch(createOrder(orderData))
    setCurrentStep(2)
    message.success('预约成功！我们会尽快安排师傅与您联系')
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    addressForm.resetFields()
    setAddressModalVisible(true)
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    addressForm.setFieldsValue(address)
    setAddressModalVisible(true)
  }

  const handleAddressSubmit = async () => {
    try {
      const values = await addressForm.validateFields()
      if (editingAddress) {
        dispatch(updateAddress({ id: editingAddress.id, ...values }))
        message.success('地址修改成功')
      } else {
        dispatch(addAddress(values))
        message.success('地址添加成功')
      }
      setAddressModalVisible(false)
    } catch (error) {
      message.error('请完善地址信息')
    }
  }

  const steps = [
    { title: '填写预约信息' },
    { title: '确认预约' },
    { title: '预约成功' }
  ]

  const step1Content = (
    <Row gutter={24}>
      <Col lg={16} md={24}>
        <Card title="预约信息" bordered={false}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              duration: currentBooking.duration,
              name: selectedAddress?.name,
              phone: selectedAddress?.phone
            }}
          >
            <Row gutter={16}>
              <Col sm={12}>
                <Form.Item
                  name="name"
                  label="联系人"
                  rules={[{ validator: validateName }]}
                  required
                >
                  <Input placeholder="请输入联系人姓名" />
                </Form.Item>
              </Col>
              <Col sm={12}>
                <Form.Item
                  name="phone"
                  label="联系电话"
                  rules={[{ validator: validatePhone }]}
                  required
                >
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col sm={12}>
                <Form.Item
                  name="date"
                  label="预约日期"
                  rules={[{ required: true, message: '请选择预约日期' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    placeholder="选择日期"
                  />
                </Form.Item>
              </Col>
              <Col sm={12}>
                <Form.Item
                  name="time"
                  label="预约时间"
                  rules={[{ required: true, message: '请选择预约时间' }]}
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    minuteStep={30}
                    placeholder="选择时间"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="duration"
              label="服务时长"
              rules={[{ required: true, message: '请选择服务时长' }]}
            >
              <InputNumber
                min={1}
                max={8}
                style={{ width: '100%' }}
                addonAfter="小时"
              />
            </Form.Item>

            <Form.Item label="服务地址">
              {addresses.length > 0 ? (
                <div>
                  <List
                    dataSource={addresses}
                    renderItem={(item) => (
                      <List.Item
                        actions={[<a onClick={() => handleEditAddress(item)}>编辑</a>]}
                        style={{
                          border: item.isDefault ? '2px solid #1677ff' : '1px solid #f0f0f0',
                          borderRadius: 8,
                          marginBottom: 8,
                          padding: 12,
                          background: item.isDefault ? '#f0f7ff' : '#fff'
                        }}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={
                            <div>
                              {item.name} {item.phone}
                              {item.isDefault && (
                                <span style={{
                                  background: '#1677ff',
                                  color: '#fff',
                                  fontSize: 12,
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  marginLeft: 8
                                }}>
                                  默认
                                </span>
                              )}
                            </div>
                          }
                          description={`${item.province}${item.city}${item.district}${item.detail}`}
                        />
                      </List.Item>
                    )}
                  />
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={handleAddAddress}
                    style={{ marginTop: 8 }}
                  >
                    添加新地址
                  </Button>
                </div>
              ) : (
                <Form.Item
                  name="address"
                  rules={[{ required: true, message: '请输入服务地址' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input.TextArea rows={3} placeholder="请输入详细服务地址" />
                </Form.Item>
              )}
            </Form.Item>

            <Form.Item name="remark" label="备注信息">
              <Input.TextArea rows={2} placeholder="请输入备注信息（选填）" />
            </Form.Item>
          </Form>
        </Card>
      </Col>

      <Col lg={8} md={24}>
        <Card title="费用预览" bordered={false} style={{ position: 'sticky', top: 80 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <img
              src={currentBooking.serviceImage}
              alt={currentBooking.serviceName}
              style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
            />
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: 4, fontSize: 14 }}>{currentBooking.serviceName}</h4>
              <p style={{ color: '#ff4d4f', fontSize: 16, fontWeight: 600, margin: 0 }}>
                ¥{currentBooking.price}
              </p>
            </div>
          </div>

          <Divider />

          <div style={{ marginBottom: 8 }} className="flex-between">
            <span style={{ color: '#666' }}>服务单价</span>
            <span>¥{currentBooking.price}</span>
          </div>
          <div style={{ marginBottom: 8 }} className="flex-between">
            <span style={{ color: '#666' }}>服务时长</span>
            <span>{currentBooking.duration} 小时</span>
          </div>

          <Divider />

          <div className="flex-between">
            <span style={{ fontSize: 16, fontWeight: 500 }}>订单总价</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#ff4d4f' }}>
              ¥{currentBooking.totalPrice}
            </span>
          </div>

          <Button
            type="primary"
            size="large"
            block
            onClick={handleNextStep}
            style={{ marginTop: 20, height: 48 }}
          >
            下一步
          </Button>
        </Card>
      </Col>
    </Row>
  )

  const step2Content = (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, paddingLeft: 12, borderLeft: '4px solid #1677ff' }}>
          预约信息确认
        </h3>
        <Row gutter={24}>
          <Col md={12}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#666' }}>服务名称：</span>
              <span>{currentBooking.serviceName}</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#666' }}>服务时长：</span>
              <span>{form.getFieldValue('duration')} 小时</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#666' }}>预约时间：</span>
              <span>
                {form.getFieldValue('date')?.format('YYYY-MM-DD')} {form.getFieldValue('time')?.format('HH:mm')}
              </span>
            </div>
          </Col>
          <Col md={12}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#666' }}>联系人：</span>
              <span>{form.getFieldValue('name') || selectedAddress?.name}</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#666' }}>联系电话：</span>
              <span>{form.getFieldValue('phone') || selectedAddress?.phone}</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#666' }}>服务地址：</span>
              <span>
                {selectedAddress
                  ? `${selectedAddress.province}${selectedAddress.city}${selectedAddress.district}${selectedAddress.detail}`
                  : form.getFieldValue('address')}
              </span>
            </div>
          </Col>
        </Row>
        {form.getFieldValue('remark') && (
          <div style={{ marginTop: 12 }}>
            <span style={{ color: '#666' }}>备注：</span>
            <span>{form.getFieldValue('remark')}</span>
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <div className="flex-between">
          <span style={{ fontSize: 16, fontWeight: 500 }}>订单总价</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#ff4d4f' }}>
            ¥{currentBooking.totalPrice}
          </span>
        </div>
      </Card>

      <div style={{ textAlign: 'center' }}>
        <Space size={16}>
          <Button size="large" onClick={() => setCurrentStep(0)}>
            返回修改
          </Button>
          <Button type="primary" size="large" onClick={handleSubmitOrder}>
            确认提交
          </Button>
        </Space>
      </div>
    </div>
  )

  const step3Content = (
    <Result
      status="success"
      title="预约提交成功！"
      subTitle="我们会尽快安排专业师傅与您联系，请保持电话畅通"
      extra={[
        <Button type="primary" key="view" onClick={() => navigate('/profile/orders')}>
          查看订单
        </Button>,
        <Button key="back" onClick={() => navigate('/')}>
          返回首页
        </Button>
      ]}
    />
  )

  return (
    <div className="booking-page">
      <div className="container">
        <h1 className="page-title">预约服务</h1>

        <Steps current={currentStep} items={steps} style={{ marginBottom: 32, background: '#fff', padding: 24, borderRadius: 8 }} />

        {currentStep === 0 && step1Content}
        {currentStep === 1 && step2Content}
        {currentStep === 2 && step3Content}
      </div>

      <Modal
        title={editingAddress ? '编辑地址' : '添加地址'}
        open={addressModalVisible}
        onCancel={() => setAddressModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={addressForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="收货人" rules={[{ validator: validateName }]}>
                <Input placeholder="请输入收货人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="手机号" rules={[{ validator: validatePhone }]}>
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="province" label="省份" rules={[{ required: true, message: '请输入省份' }]}>
                <Input placeholder="省份" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="城市" rules={[{ required: true, message: '请输入城市' }]}>
                <Input placeholder="城市" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="district" label="区县" rules={[{ required: true, message: '请输入区县' }]}>
                <Input placeholder="区县" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="detail" label="详细地址" rules={[{ required: true, message: '请输入详细地址' }]}>
            <Input.TextArea rows={2} placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item name="isDefault" label="" valuePropName="checked">
            <Input type="checkbox" /> 设为默认地址
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setAddressModalVisible(false)}>取消</Button>
              <Button type="primary" onClick={handleAddressSubmit}>保存</Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Booking
