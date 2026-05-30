import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Card, List, Tag, Button, Empty, Tabs, Modal, message,
  Row, Col, Image, Steps, Timeline
} from 'antd'
import {
  ClockCircleOutlined, CheckOutlined, CloseOutlined,
  CarOutlined, EyeOutlined
} from '@ant-design/icons'
import { cancelOrder, confirmOrder } from '@/store/orderSlice'
import './index.scss'

const { TabPane } = Tabs
const { Step } = Steps

const Orders = () => {
  const dispatch = useDispatch()
  const { orders } = useSelector(state => state.order)
  const [activeTab, setActiveTab] = useState('all')
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const statusMap = {
    pending: { text: '待付款', color: 'orange', icon: <ClockCircleOutlined /> },
    shipping: { text: '配送中', color: 'blue', icon: <CarOutlined /> },
    completed: { text: '已完成', color: 'green', icon: <CheckOutlined /> },
    cancelled: { text: '已取消', color: 'default', icon: <CloseOutlined /> }
  }

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status === activeTab)

  const handleViewDetail = (order) => {
    setSelectedOrder(order)
    setDetailVisible(true)
  }

  const handleCancelOrder = (orderId) => {
    Modal.confirm({
      title: '确认取消订单',
      content: '确定要取消这个订单吗？',
      onOk: () => {
        dispatch(cancelOrder(orderId))
        message.success('订单已取消')
      }
    })
  }

  const handleConfirmOrder = (orderId) => {
    Modal.confirm({
      title: '确认收货',
      content: '确认已收到商品吗？',
      onOk: () => {
        dispatch(confirmOrder(orderId))
        message.success('已确认收货')
      }
    })
  }

  const renderOrderActions = (order) => {
    switch (order.status) {
      case 'pending':
        return (
          <>
            <Button size="small" onClick={() => handleCancelOrder(order.id)}>取消订单</Button>
            <Button type="primary" size="small">立即付款</Button>
          </>
        )
      case 'shipping':
        return (
          <>
            <Button size="small" onClick={() => handleViewDetail(order)}>
              <EyeOutlined /> 查看物流
            </Button>
            <Button type="primary" size="small" onClick={() => handleConfirmOrder(order.id)}>
              确认收货
            </Button>
          </>
        )
      case 'completed':
        return (
          <>
            <Button size="small">申请售后</Button>
            <Button type="primary" size="small">再次购买</Button>
          </>
        )
      default:
        return <Button type="primary" size="small">再次购买</Button>
    }
  }

  const renderSteps = (order) => {
    const steps = [
      { title: '下单成功', status: 'finish' },
      { title: '商品备货', status: order.status === 'pending' ? 'process' : 'finish' },
      { title: '配送中', status: ['shipping', 'completed'].includes(order.status) ? 'finish' : 'wait' },
      { title: '已完成', status: order.status === 'completed' ? 'finish' : 'wait' }
    ]

    if (order.status === 'cancelled') {
      return (
        <Steps current={0} status="error" size="small">
          <Step title="订单已取消" />
        </Steps>
      )
    }

    return (
      <Steps current={steps.findIndex(s => s.status === 'process' || s.status === 'wait')} size="small">
        {steps.map((step, idx) => (
          <Step key={idx} title={step.title} status={step.status} />
        ))}
      </Steps>
    )
  }

  return (
    <div className="orders-page">
      <h2 className="page-title">我的订单</h2>

      <Card className="orders-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部订单" key="all" />
          <TabPane tab="待付款" key="pending" />
          <TabPane tab="配送中" key="shipping" />
          <TabPane tab="已完成" key="completed" />
          <TabPane tab="已取消" key="cancelled" />
        </Tabs>

        {filteredOrders.length > 0 ? (
          <List
            dataSource={filteredOrders}
            renderItem={order => (
              <List.Item className="order-item" key={order.id}>
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-no">订单号：{order.id}</span>
                    <span className="order-time">{order.createTime}</span>
                  </div>
                  <Tag color={statusMap[order.status].color}>
                    {statusMap[order.status].icon} {statusMap[order.status].text}
                  </Tag>
                </div>

                <div className="order-products">
                  {order.products.map((item, idx) => (
                    <div key={idx} className="product-item">
                      <Image src={item.image} width={60} height={60} className="product-image" />
                      <div className="product-info">
                        <div className="product-name">{item.name}</div>
                        <div className="product-spec">{item.spec}</div>
                      </div>
                      <div className="product-price">
                        <span className="price">¥{item.price.toFixed(1)}</span>
                        <span className="quantity">x{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    共{order.products.reduce((sum, p) => sum + p.quantity, 0)}件商品，
                    实付 <span className="total-price">¥{order.payAmount.toFixed(1)}</span>
                  </div>
                  <div className="order-actions">
                    {renderOrderActions(order)}
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无订单" className="empty-orders" />
        )}
      </Card>

      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>
        ]}
        width={600}
      >
        {selectedOrder && (
          <div className="order-detail">
            <div className="detail-section">
              <h4>订单状态</h4>
              {renderSteps(selectedOrder)}
            </div>

            {selectedOrder.tracking && (
              <div className="detail-section">
                <h4>物流信息</h4>
                <Timeline>
                  <Timeline.Item color="green">
                    <p>快件已送达，请及时签收</p>
                    <p className="time">2026-05-18 10:30:00</p>
                  </Timeline.Item>
                  <Timeline.Item>
                    <p>快件正在派送中</p>
                    <p className="time">2026-05-18 08:00:00</p>
                  </Timeline.Item>
                  <Timeline.Item>
                    <p>快件已到达北京朝阳分拨中心</p>
                    <p className="time">2026-05-18 06:00:00</p>
                  </Timeline.Item>
                  <Timeline.Item>
                    <p>快件已发出</p>
                    <p className="time">2026-05-17 20:00:00</p>
                  </Timeline.Item>
                </Timeline>
                <p className="tracking-info">
                  物流公司：{selectedOrder.tracking.company}<br />
                  物流单号：{selectedOrder.tracking.number}
                </p>
              </div>
            )}

            <div className="detail-section">
              <h4>收货地址</h4>
              <p>{selectedOrder.address.name} {selectedOrder.address.phone}</p>
              <p>{selectedOrder.address.province}{selectedOrder.address.city}{selectedOrder.address.district}{selectedOrder.address.detail}</p>
              <p>配送时段：{selectedOrder.deliveryTime}</p>
            </div>

            <div className="detail-section">
              <h4>商品清单</h4>
              {selectedOrder.products.map((item, idx) => (
                <div key={idx} className="detail-product">
                  <Image src={item.image} width={50} height={50} />
                  <div className="info">
                    <div>{item.name}</div>
                    <div className="spec">{item.spec}</div>
                  </div>
                  <div className="price">¥{item.price.toFixed(1)} x{item.quantity}</div>
                </div>
              ))}
            </div>

            <div className="detail-section price-summary">
              <Row>
                <Col span={12}>商品金额：</Col>
                <Col span={12} className="text-right">¥{selectedOrder.totalAmount.toFixed(1)}</Col>
                <Col span={12}>实付金额：</Col>
                <Col span={12} className="text-right total">¥{selectedOrder.payAmount.toFixed(1)}</Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Orders
