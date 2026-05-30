import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Row,
  Col,
  Card,
  Button,
  Tag,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  InputNumber,
  message,
  Table,
  Space
} from 'antd'
import {
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { fetchServiceDetail, fetchMasters } from '../store/actions/serviceActions'
import { createOrder } from '../store/actions/orderActions'
import PageContainer from '../components/common/PageContainer'
import { REGEX } from '../utils/validate'
import { useLoading } from '../hooks/useLoading'
import './ServiceDetail.less'

const { Option } = Select
const { TextArea } = Input

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, withLoading } = useLoading()
  const { currentService, masters, loading: serviceLoading } = useSelector(state => state.services)
  const { isLoggedIn, userInfo } = useSelector(state => state.user)
  const [selectedMaster, setSelectedMaster] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchServiceDetail(id))
    dispatch(fetchMasters())
  }, [dispatch, id])

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day')
  }

  const handleSubmit = async (values) => {
    if (!isLoggedIn) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    const appointmentTime = `${values.date.format('YYYY-MM-DD')} ${values.time.format('HH:mm')}`

    const orderData = {
      serviceId: currentService.id,
      serviceName: currentService.name,
      masterId: selectedMaster,
      masterName: masters.find(m => m.id === selectedMaster)?.name,
      customerName: values.name,
      phone: values.phone,
      address: values.address,
      appointmentTime,
      price: currentService.price,
      remark: values.remark
    }

    const result = await withLoading(() => dispatch(createOrder(orderData)))

    if (result?.success) {
      message.success('预约成功！我们将尽快与您联系')
      navigate('/user/orders')
    } else {
      message.error('预约失败，请重试')
    }
  }

  const columns = [
    {
      title: '服务项目',
      dataIndex: 'item',
      key: 'item'
    },
    {
      title: '价格（元）',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      render: (price) => <span style={{ color: '#f5222d', fontWeight: 'bold' }}>¥{price}</span>
    }
  ]

  if (!currentService) {
    return <PageContainer loading={serviceLoading} empty={!serviceLoading} />
  }

  return (
    <PageContainer loading={serviceLoading}>
      <div className="service-detail-page">
        <Row gutter={24}>
          <Col xs={24} lg={14}>
            <Card className="service-info-card">
              <div className="service-header">
                <span className="service-icon">{currentService.icon}</span>
                <div className="service-title">
                  <h1>{currentService.name}</h1>
                  <p className="service-desc">{currentService.description}</p>
                </div>
                <div className="service-price">
                  <span className="price-label">起步价</span>
                  <span className="price-value">¥{currentService.price}</span>
                </div>
              </div>

              <div className="service-features">
                {currentService.features.map((feature, index) => (
                  <Tag key={index} color="blue" icon={<CheckCircleOutlined />}>
                    {feature}
                  </Tag>
                ))}
                <Tag icon={<ClockCircleOutlined />}>预计时长：{currentService.duration}</Tag>
              </div>
            </Card>

            <Card title="收费标准" className="price-card">
              <Table
                columns={columns}
                dataSource={currentService.priceDetails}
                pagination={false}
                rowKey="item"
              />
              <p className="price-note">* 以上价格仅供参考，具体费用以上门检测后为准</p>
            </Card>

            <Card title="服务流程" className="process-card">
              <Row gutter={[16, 16]}>
                {[
                  { step: 1, title: '在线预约', desc: '填写信息提交预约' },
                  { step: 2, title: '师傅接单', desc: '就近师傅快速响应' },
                  { step: 3, title: '上门服务', desc: '准时到达专业服务' },
                  { step: 4, title: '完成支付', desc: '满意后付款评价' }
                ].map(item => (
                  <Col xs={12} sm={6} key={item.step}>
                    <div className="process-item">
                      <div className="step-number">{item.step}</div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="立即预约" className="booking-card" bordered={false}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  name: userInfo?.nickname || ''
                }}
              >
                <Form.Item
                  name="name"
                  label="联系人姓名"
                  rules={[
                    { required: true, message: '请输入姓名' },
                    { min: 2, message: '姓名至少2个字符' }
                  ]}
                >
                  <Input placeholder="请输入您的姓名" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="联系电话"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: REGEX.phone, message: '请输入正确的手机号' }
                  ]}
                >
                  <Input placeholder="请输入您的手机号" maxLength={11} />
                </Form.Item>

                <Form.Item
                  name="address"
                  label="详细地址"
                  rules={[
                    { required: true, message: '请输入详细地址' },
                    { min: 5, message: '地址至少5个字符' }
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="请输入详细地址，如：北京市朝阳区XXX小区X号楼X单元XXX"
                  />
                </Form.Item>

                <Form.Item label="选择师傅" required>
                  <Select
                    placeholder="请选择师傅（可选，不选则系统自动分配）"
                    onChange={setSelectedMaster}
                    allowClear
                  >
                    {masters.map(master => (
                      <Option key={master.id} value={master.id}>
                        {master.name} - {master.experience}年经验 - {master.rating}分
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="date"
                      label="预约日期"
                      rules={[{ required: true, message: '请选择日期' }]}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        disabledDate={disabledDate}
                        placeholder="选择日期"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="time"
                      label="预约时间"
                      rules={[{ required: true, message: '请选择时间' }]}
                    >
                      <TimePicker
                        style={{ width: '100%' }}
                        format="HH:mm"
                        minuteStep={30}
                        placeholder="选择时间"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="remark" label="备注信息">
                  <TextArea rows={2} placeholder="如有特殊要求请备注" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                  >
                    确认预约
                  </Button>
                </Form.Item>

                <p className="booking-tips">
                  <PhoneOutlined /> 紧急情况请直接拨打：<strong>400-888-8888</strong>
                </p>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  )
}

export default ServiceDetail
