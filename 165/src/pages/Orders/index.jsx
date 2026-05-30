import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Tabs, Button, Tag, Rate, Modal, Form, Input, message, List, Avatar, Empty } from 'antd'
import { updateOrderStatus, addOrderComment } from '@/store/slices/orderSlice'
import './style.css'

const Orders = () => {
  const dispatch = useDispatch()
  const { orders } = useSelector(state => state.order)
  const [activeTab, setActiveTab] = useState('all')
  const [commentModalVisible, setCommentModalVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [commentForm] = Form.useForm()

  const statusMap = {
    pending: { label: '待服务', color: 'orange' },
    confirmed: { label: '已确认', color: 'blue' },
    completed: { label: '已完成', color: 'green' },
    cancelled: { label: '已取消', color: 'default' },
    rated: { label: '已评价', color: 'purple' }
  }

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab)

  const handleCancelOrder = (orderId) => {
    Modal.confirm({
      title: '确认取消订单',
      content: '取消后将无法恢复，确定要取消这个订单吗？',
      okText: '确认取消',
      cancelText: '再想想',
      onOk: () => {
        dispatch(updateOrderStatus({ orderId, status: 'cancelled' }))
        message.success('订单已取消')
      }
    })
  }

  const handleOpenComment = (order) => {
    setCurrentOrder(order)
    commentForm.resetFields()
    setCommentModalVisible(true)
  }

  const handleSubmitComment = async () => {
    try {
      const values = await commentForm.validateFields()
      dispatch(addOrderComment({
        orderId: currentOrder.id,
        rating: values.rating,
        comment: values.comment
      }))
      message.success('评价提交成功，感谢您的反馈！')
      setCommentModalVisible(false)
    } catch (error) {
      message.warning('请完善评价信息')
    }
  }

  const tabItems = [
    { key: 'all', label: `全部 (${orders.length})` },
    { key: 'pending', label: `待服务 (${orders.filter(o => o.status === 'pending').length})` },
    { key: 'completed', label: `已完成 (${orders.filter(o => o.status === 'completed').length})` },
    { key: 'cancelled', label: `已取消 (${orders.filter(o => o.status === 'cancelled').length})` }
  ]

  const getEmptyText = () => {
    switch (activeTab) {
      case 'pending':
        return '暂无待服务的订单'
      case 'completed':
        return '暂无已完成的订单'
      case 'cancelled':
        return '暂无已取消的订单'
      default:
        return '您还没有任何订单，快去预约服务吧！'
    }
  }

  return (
    <div className="orders-page">
      <Card bordered={false} title="我的订单">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        {filteredOrders.length > 0 ? (
          <List
            dataSource={filteredOrders}
            renderItem={order => (
              <List.Item
                className="order-item"
                actions={
                  order.status === 'pending'
                    ? [
                        <Button type="primary" size="small">联系师傅</Button>,
                        <Button size="small" danger onClick={() => handleCancelOrder(order.id)}>
                          取消订单
                        </Button>
                      ]
                    : order.status === 'completed'
                      ? [<Button type="primary" size="small" onClick={() => handleOpenComment(order)}>去评价</Button>]
                      : order.status === 'rated'
                        ? [<Button size="small" disabled>已评价</Button>]
                        : [<Button size="small" disabled>已取消</Button>]
                }
              >
                <List.Item.Meta
                  avatar={<img src={order.serviceImage} alt="" className="order-image" />}
                  title={
                    <div className="order-title">
                      <span>{order.serviceName}</span>
                      <Tag color={statusMap[order.status]?.color}>
                        {statusMap[order.status]?.label}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="order-info">
                      <p className="order-text">
                        <span className="label">订单编号：</span>
                        <span>{order.id}</span>
                      </p>
                      <p className="order-text">
                        <span className="label">预约时间：</span>
                        <span>{order.appointmentTime}</span>
                      </p>
                      <p className="order-text">
                        <span className="label">服务地址：</span>
                        <span>{order.address}</span>
                      </p>
                      <p className="order-price">
                        ¥{order.price}
                      </p>
                      {order.rating && (
                        <div className="order-rating">
                          <Rate disabled value={order.rating} />
                          <span>{order.comment}</span>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description={getEmptyText()}
            style={{ padding: 40 }}
          />
        )}
      </Card>

      <Modal
        title="服务评价"
        open={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        footer={null}
        width={480}
      >
        {currentOrder && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <p style={{ margin: 0 }}>
              评价服务：<strong>{currentOrder.serviceName}</strong>
            </p>
          </div>
        )}
        <Form form={commentForm} layout="vertical">
          <Form.Item
            name="rating"
            label="服务评分"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="comment"
            label="评价内容"
            rules={[{ required: true, message: '请输入评价内容' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="请分享您的服务体验，帮助其他用户做出选择"
            />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setCommentModalVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleSubmitComment} style={{ marginLeft: 8 }}>
              提交评价
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Orders
