import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Card, Descriptions, Button, Tag, Space, Divider, Steps, Image, Rate,
} from 'antd'
import {
  EnvironmentOutlined, ClockCircleOutlined, PhoneOutlined, ArrowLeftOutlined,
} from '@ant-design/icons'
import PageState from '@/components/common/PageState'
import { formatPrice, formatDateTime, getOrderStatusText, getOrderStatusColor } from '@/utils'

const { Step } = Steps

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { orders } = useSelector((state) => state.order)

  const order = useMemo(() => {
    return orders.find((o) => o.id === parseInt(id))
  }, [orders, id])

  const getStepStatus = (index) => {
    const statusSteps = ['pending', 'confirmed', 'inProgress', 'completed']
    const currentIndex = statusSteps.indexOf(order?.status)
    if (index < currentIndex) return 'finish'
    if (index === currentIndex) return 'process'
    return 'wait'
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <PageState data={null} emptyText="订单不存在" />
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/orders')}
        style={{ marginBottom: 16 }}
      >
        返回订单列表
      </Button>

      <Card style={{ marginBottom: 24 }}>
        <div className="flex-between" style={{ marginBottom: 24 }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>订单详情</h2>
            <div style={{ color: '#666' }}>订单号：{order.orderNo}</div>
          </div>
          <Tag color={getOrderStatusColor(order.status)} style={{ fontSize: 16, padding: '4px 16px' }}>
            {getOrderStatusText(order.status)}
          </Tag>
        </div>

        <Steps current={0}>
          <Step
            status={getStepStatus(0)}
            title="提交订单"
            description={formatDateTime(order.createdAt)}
          />
          <Step status={getStepStatus(1)} title="商家确认" />
          <Step status={getStepStatus(2)} title="服务中" />
          <Step status={getStepStatus(3)} title="服务完成" />
        </Steps>
      </Card>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <Card title="服务信息" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <Image
                src={order.serviceImage}
                width={120}
                height={90}
                style={{ borderRadius: 6, objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 8 }}>{order.serviceName}</h3>
                <div style={{ color: '#666', fontSize: 13 }}>
                  <EnvironmentOutlined /> {order.address}
                </div>
                <div style={{ color: '#666', fontSize: 13 }}>
                  <ClockCircleOutlined /> {formatDateTime(order.appointmentTime)}
                </div>
                {order.groomerName && (
                  <div style={{ color: '#666', fontSize: 13 }}>
                    服务人员：{order.groomerName}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card title="宠物信息" style={{ marginBottom: 24 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="宠物名称">{order.petName}</Descriptions.Item>
              <Descriptions.Item label="服务类型">{order.serviceName}</Descriptions.Item>
            </Descriptions>
          </Card>

          {order.remark && (
            <Card title="备注信息">
              <p style={{ color: '#666', margin: 0 }}>{order.remark}</p>
            </Card>
          )}

          {order.review && (
            <Card title="我的评价" style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Rate disabled value={order.review.rating} style={{ fontSize: 14 }} />
                <span style={{ color: '#999', fontSize: 12 }}>
                  {formatDateTime(order.review.createdAt)}
                </span>
              </div>
              <p style={{ color: '#666', margin: 0 }}>{order.review.content}</p>
            </Card>
          )}
        </div>

        <div style={{ width: 320 }}>
          <Card title="费用明细" style={{ position: 'sticky', top: 80 }}>
            <div style={{ marginBottom: 12 }} className="flex-between">
              <span style={{ color: '#666' }}>服务价格</span>
              <span>{formatPrice(order.originalPrice)}</span>
            </div>
            {order.coupon > 0 && (
              <div style={{ marginBottom: 12 }} className="flex-between">
                <span style={{ color: '#666' }}>优惠券</span>
                <span style={{ color: '#52c41a' }}>-{formatPrice(order.coupon)}</span>
              </div>
            )}
            <Divider style={{ margin: '12px 0' }} />
            <div className="flex-between">
              <span style={{ fontWeight: 600 }}>实付金额</span>
              <span style={{ color: '#ff6b35', fontSize: 24, fontWeight: 'bold' }}>
                {formatPrice(order.totalPrice)}
              </span>
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <Descriptions column={1} size="small">
              <Descriptions.Item label="支付方式">
                {order.payMethod === 'wechat' ? '微信支付' : order.payMethod === 'alipay' ? '支付宝' : '银行卡'}
              </Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {formatDateTime(order.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="联系人">
                {order.contactName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {order.contactPhone || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
