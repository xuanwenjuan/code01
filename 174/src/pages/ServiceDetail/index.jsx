import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Row, Col, Button, Tag, Radio, DatePicker, Input, Modal, Steps,
  Rate, Table, Card, Avatar, Divider, Tabs, message, Space
} from 'antd'
import {
  ClockCircleOutlined, CheckCircleOutlined, EnvironmentOutlined,
  PhoneOutlined, UserOutlined, StarOutlined, SafetyCertificateOutlined,
  FireOutlined
} from '@ant-design/icons'
import useRequest from '@/hooks/useRequest'
import useAuth from '@/hooks/useAuth'
import { getServiceById, getTimeSlots, createOrder, getPackages, getWorkers } from '@/mock/api'
import LoadingWrapper from '@/components/LoadingWrapper'
import PackageCard from '@/components/PackageCard'
import { useDispatch } from 'react-redux'
import { addOrder } from '@/store/slices/orderSlice'
import dayjs from 'dayjs'
import './index.css'

const { TextArea } = Input
const { RangePicker } = DatePicker

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userInfo, isLoggedIn } = useAuth()
  
  const { data: service, loading: serviceLoading } = useRequest(() => getServiceById(id))
  const { data: timeSlots, loading: timeLoading } = useRequest(getTimeSlots)
  const { data: packages, loading: pkgLoading } = useRequest(getPackages)
  const { data: workers, loading: workerLoading } = useRequest(getWorkers)
  
  const [selectedType, setSelectedType] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [remark, setRemark] = useState('')
  const [bookingModal, setBookingModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('price')

  const relatedPackages = useMemo(() => {
    if (!packages || !service) return []
    return packages.filter(pkg => pkg.services.includes(Number(id)))
  }, [packages, service, id])

  const handleBook = () => {
    if (!isLoggedIn) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    if (!selectedType) {
      message.warning('请选择服务类型')
      return
    }
    setBookingModal(true)
  }

  const handleSubmitOrder = async () => {
    if (!selectedDate || !selectedTime) {
      message.warning('请选择上门时间')
      return
    }
    if (!address) {
      message.warning('请输入上门地址')
      return
    }
    if (!phone) {
      message.warning('请输入联系电话')
      return
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      message.warning('请输入正确的手机号码')
      return
    }

    setSubmitting(true)
    try {
      const appointmentTime = `${selectedDate.format('YYYY-MM-DD')} ${selectedTime}`
      const result = await createOrder({
        serviceId: service.id,
        serviceName: service.name,
        serviceType: selectedType.type,
        price: selectedType.price,
        appointmentTime,
        address,
        phone,
        remark
      })
      
      if (result.success) {
        dispatch(addOrder(result.data))
        message.success('预约成功！我们会尽快安排师傅上门服务')
        setBookingModal(false)
        navigate('/user/orders')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day')
  }

  const priceColumns = [
    {
      title: '服务类型',
      dataIndex: 'type',
      key: 'type',
      width: 200,
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => <span className="text-red-500 font-semibold text-lg">¥{price}</span>
    },
    {
      title: '服务时长',
      key: 'duration',
      width: 120,
      render: () => service?.duration || '约60分钟'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type={selectedType?.type === record.type ? 'primary' : 'default'}
          size="small"
          onClick={() => setSelectedType(record)}
        >
          {selectedType?.type === record.type ? '已选择' : '选择'}
        </Button>
      )
    }
  ]

  const tabItems = [
    {
      key: 'price',
      label: '收费标准',
      children: (
        <div className="tab-content">
          <Table
            columns={priceColumns}
            dataSource={service?.detail?.priceList || []}
            pagination={false}
            rowKey="type"
            size="middle"
          />
          <div className="price-notice mt-4">
            <p className="text-gray-500 text-sm">* 以上价格仅供参考，实际费用以师傅上门检测后为准</p>
            <p className="text-gray-500 text-sm">* 服务过程中如需更换配件，费用另行计算</p>
          </div>
        </div>
      )
    },
    {
      key: 'features',
      label: '服务特色',
      children: (
        <div className="tab-content">
          <Row gutter={[16, 16]}>
            {service?.detail?.features?.map((feature, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card className="feature-card" size="small">
                  <div className="flex items-center gap-3">
                    <div className="feature-icon-wrap">
                      <CheckCircleOutlined className="check-icon" />
                    </div>
                    <span>{feature}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )
    },
    {
      key: 'process',
      label: '服务流程',
      children: (
        <div className="tab-content">
          <Steps
            direction="vertical"
            current={-1}
            items={service?.detail?.process?.map(step => ({
              title: <span className="font-medium">{step.title}</span>,
              description: step.desc
            }))}
          />
        </div>
      )
    }
  ]

  if (serviceLoading || !service) {
    return <LoadingWrapper loading={true} tip="加载中..." />
  }

  return (
    <div className="service-detail-page container">
      <div className="page-content">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className="detail-card" bordered={false}>
              <div className="detail-header">
                <img src={service.image} alt={service.name} className="detail-image" />
                <div className="detail-info">
                  <h1 className="detail-title">{service.name}</h1>
                  <p className="detail-desc">{service.description}</p>
                  <div className="detail-tags">
                    {service.tags.map((tag, index) => (
                      <Tag key={index} color="blue">{tag}</Tag>
                    ))}
                  </div>
                  <div className="detail-meta">
                    <Space size={24}>
                      <span><ClockCircleOutlined /> 服务时长：{service.duration}</span>
                      <span><StarOutlined /> 4.9分（{Math.floor(Math.random() * 500 + 100)}条评价）</span>
                    </Space>
                  </div>
                  <div className="detail-price">
                    <span className="price-label">起</span>
                    <span className="price-value">¥{service.price}</span>
                    <span className="price-original">¥{service.originalPrice}</span>
                    <Tag color="red" className="discount-tag">
                      省¥{service.originalPrice - service.price}
                    </Tag>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="mt-4" bordered={false}>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                className="detail-tabs"
              />
            </Card>

            {relatedPackages.length > 0 && (
              <Card
                className="mt-4"
                bordered={false}
                title={
                  <div className="flex items-center gap-2">
                    <FireOutlined className="text-orange-500" />
                    <span>相关套餐推荐</span>
                    <Tag color="red" className="ml-2">更划算</Tag>
                  </div>
                }
              >
                <Row gutter={[16, 16]}>
                  {relatedPackages.map(pkg => (
                    <Col xs={24} sm={12} key={pkg.id}>
                      <PackageCard pkg={pkg} />
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

            <Card
              className="mt-4"
              bordered={false}
              title={
                <div className="flex items-center gap-2">
                  <SafetyCertificateOutlined className="text-blue-500" />
                  <span>专业服务师傅</span>
                </div>
              }
            >
              <LoadingWrapper loading={workerLoading}>
                <Row gutter={[16, 16]}>
                  {workers?.slice(0, 4).map(worker => (
                    <Col xs={24} sm={12} md={6} key={worker.id}>
                      <Card className="worker-card card-hover" size="small">
                        <div className="text-center">
                          <Avatar size={64} src={worker.avatar} />
                          <h4 className="mt-2 mb-1 font-medium">{worker.name}</h4>
                          <div className="flex justify-center items-center gap-1 mb-2">
                            <Rate disabled value={worker.rating} allowHalf className="text-sm" />
                            <span className="text-sm text-gray-500">{worker.rating}</span>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            服务 {worker.orders} 单 · {worker.experience}经验
                          </div>
                          <div className="flex flex-wrap justify-center gap-1">
                            {worker.skills.map((skill, idx) => (
                              <Tag key={idx} size="small" color="blue">{skill}</Tag>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </LoadingWrapper>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <div className="booking-card sticky-top">
              <Card bordered={false}>
                <h3 className="booking-title">快速预约</h3>
                
                <div className="booking-section">
                  <h4 className="section-label">选择服务类型</h4>
                  <Radio.Group
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="type-radio"
                  >
                    {service.detail.priceList.map((item, index) => (
                      <Radio key={index} value={item} className="type-item">
                        <span className="type-name">{item.type}</span>
                        <span className="type-price">¥{item.price}</span>
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>

                <Divider className="my-4" />

                <div className="booking-section">
                  <h4 className="section-label">选择上门时间</h4>
                  <div className="time-select-area">
                    <DatePicker
                      style={{ width: '100%', marginBottom: 12 }}
                      disabledDate={disabledDate}
                      value={selectedDate}
                      onChange={setSelectedDate}
                      placeholder="请选择上门日期"
                      size="large"
                    />
                    <LoadingWrapper loading={timeLoading}>
                      <Radio.Group
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="time-radio"
                      >
                        {timeSlots?.map((slot, index) => (
                          <Radio.Button key={index} value={slot}>
                            {slot}
                          </Radio.Button>
                        ))}
                      </Radio.Group>
                    </LoadingWrapper>
                  </div>
                </div>

                <Divider className="my-4" />

                <div className="booking-summary">
                  <div className="summary-row">
                    <span>服务项目</span>
                    <span>{service.name}</span>
                  </div>
                  <div className="summary-row">
                    <span>服务类型</span>
                    <span>{selectedType?.type || '请选择'}</span>
                  </div>
                  <div className="summary-row">
                    <span>上门时间</span>
                    <span>
                      {selectedDate ? selectedDate.format('YYYY-MM-DD') : '请选择'}
                      {selectedTime ? ` ${selectedTime}` : ''}
                    </span>
                  </div>
                  <div className="summary-row total">
                    <span>预估费用</span>
                    <span className="text-red-500 text-xl font-bold">
                      ¥{selectedType?.price || 0}
                    </span>
                  </div>
                </div>

                <Button
                  type="primary"
                  block
                  size="large"
                  className="book-btn mt-4"
                  onClick={handleBook}
                  disabled={!selectedType}
                >
                  {selectedType ? '立即预约' : '请先选择服务类型'}
                </Button>

                <div className="booking-tips mt-4">
                  <p className="text-sm text-gray-500 mb-1">
                    <EnvironmentOutlined className="mr-1" /> 服务范围：全城覆盖
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    <PhoneOutlined className="mr-1" /> 服务热线：400-888-8888
                  </p>
                  <p className="text-sm text-gray-500">
                    <ClockCircleOutlined className="mr-1" /> 工作时间：08:00-21:00
                  </p>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      <Modal
        title="确认预约信息"
        open={bookingModal}
        onCancel={() => setBookingModal(false)}
        onOk={handleSubmitOrder}
        confirmLoading={submitting}
        width={520}
        okText="确认预约"
        cancelText="取消"
      >
        <div className="booking-form">
          <div className="form-item">
            <label>服务项目</label>
            <div className="form-value">
              {service.name} - {selectedType?.type}
              <span className="text-red-500 ml-2">¥{selectedType?.price}</span>
            </div>
          </div>
          <div className="form-item">
            <label>上门时间</label>
            <div className="form-value">
              {selectedDate?.format('YYYY-MM-DD') || '请选择'} {selectedTime || ''}
            </div>
          </div>
          <div className="form-item">
            <label>上门地址 <span className="text-red-500">*</span></label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="请输入详细地址，如：北京市朝阳区XX小区X号楼X单元XXX室"
              size="large"
            />
          </div>
          <div className="form-item">
            <label>联系电话 <span className="text-red-500">*</span></label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入联系电话"
              maxLength={11}
              size="large"
            />
          </div>
          <div className="form-item">
            <label>备注信息</label>
            <TextArea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="选填，如有特殊要求请备注（如：需要自带鞋套、家中有宠物等）"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ServiceDetail
