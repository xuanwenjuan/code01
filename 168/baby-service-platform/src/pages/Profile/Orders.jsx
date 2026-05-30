import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Card, List, Tag, Button, Tabs, Modal, message, Rate, Form, Input } from 'antd'
import { getStatusText, getStatusColor, formatDateTime, formatPrice } from '@/utils'
import { cancelOrder, updateOrderStatus } from '@/store/slices/orderSlice'
import { addReview } from '@/store/slices/serviceSlice'
import { useAuth } from '@/hooks/useAuth'
import EmptyState from '@/components/Common/EmptyState'
import { usePagination } from '@/hooks/usePagination'

const { TextArea } = Input

const Orders = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser } = useAuth()
  const { orders } = useSelector(state => state.order)
  const [activeTab, setActiveTab] = useState('all')
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [reviewForm] = Form.useForm()

  const myOrders = orders.filter(o => o.userId === currentUser?.id)

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return myOrders
    return myOrders.filter(o => o.status === activeTab)
  }, [myOrders, activeTab])

  const { paginatedData, currentPage, total, pageSize, handlePageChange } = usePagination(filteredOrders, 5)

  const handleCancelOrder = (orderId) => {
    Modal.confirm({
      title: '确认取消订单',
      content: '您确定要取消这个订单吗？',
      onOk: () => {
        dispatch(cancelOrder(orderId))
        message.success('订单已取消')
      }
    })
  }

  const handleReview = (order) => {
    setCurrentOrder(order)
    setReviewModalVisible(true)
  }

  const handleReviewSubmit = (values) => {
    if (!currentOrder) return

    const review = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.nickname,
      userAvatar: currentUser.avatar,
      rating: values.rating,
      content: values.content,
      time: new Date().toISOString().split('T')[0]
    }

    dispatch(addReview({ serviceId: currentOrder.serviceId, review }))
    dispatch(updateOrderStatus({ orderId: currentOrder.id, status: 'reviewed' }))
    message.success('评价成功')
    setReviewModalVisible(false)
    reviewForm.resetFields()
  }

  const renderActions = (order) => {
    switch (order.status) {
      case 'pending':
        return [
          <Button key="cancel" size="small" onClick={() => handleCancelOrder(order.id)}>
            取消订单
          </Button>
        ]
      case 'confirmed':
        return [
          <Button key="cancel" size="small" onClick={() => handleCancelOrder(order.id)}>
            取消订单
          </Button>
        ]
      case 'completed':
        return !order.review ? [
          <Button key="review" type="primary" size="small" onClick={() => handleReview(order)}>
            去评价
          </Button>
        ] : [
          <Tag key="reviewed" color="green">已评价</Tag>
        ]
      default:
        return null
    }
  }

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待确认' },
    { key: 'confirmed', label: '已确认' },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' }
  ]

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>我的订单</h1>
          <p>查看和管理您的预约订单</p>
        </div>
      </div>

      <div className="container page-content">
        <Card className="card-shadow">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ marginBottom: 24 }}
          />

          {paginatedData.length > 0 ? (
            <>
              <List
                dataSource={paginatedData}
                renderItem={(order) => (
                  <List.Item
                    style={{
                      marginBottom: 16,
                      padding: 16,
                      background: '#fff',
                      borderRadius: 8,
                      border: '1px solid #f0f0f0'
                    }}
                    actions={renderActions(order)}
                  >
                    <List.Item.Meta
                      avatar={<img src={order.serviceImage} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />}
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: 16, fontWeight: 600, marginRight: 12 }}>{order.serviceName}</span>
                            <Tag color={getStatusColor(order.status)}>{getStatusText(order.status)}</Tag>
                          </div>
                          <span className="price-text" style={{ fontSize: 18, fontWeight: 700 }}>
                            {formatPrice(order.price)}
                          </span>
                        </div>
                      }
                      description={
                        <div style={{ marginTop: 8 }}>
                          <div style={{ color: '#666', marginBottom: 4 }}>
                            订单号：{order.orderNo}
                          </div>
                          <div style={{ color: '#666', marginBottom: 4 }}>
                            服务周期：{order.serviceCycle} · 服务时间：{order.serviceTime}
                          </div>
                          <div style={{ color: '#999', fontSize: 12 }}>
                            下单时间：{formatDateTime(order.createTime)}
                          </div>
                          {order.remark && (
                            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                              备注：{order.remark}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />

              {total > pageSize && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <div style={{ display: 'inline-block' }}>
                    {[...Array(Math.ceil(total / pageSize))].map((_, i) => (
                      <Button
                        key={i}
                        type={currentPage === i + 1 ? 'primary' : 'default'}
                        onClick={() => handlePageChange(i + 1)}
                        style={{ marginRight: 8 }}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              description="暂无订单"
              actionText="去逛逛"
              onAction={() => navigate('/services')}
            />
          )}
        </Card>
      </div>

      <Modal
        title="服务评价"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={reviewForm}
          onFinish={handleReviewSubmit}
          layout="vertical"
        >
          <Form.Item
            label="服务评分"
            name="rating"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            label="评价内容"
            name="content"
            rules={[{ required: true, message: '请输入评价内容' }]}
          >
            <TextArea rows={4} placeholder="请分享您的服务体验" maxLength={500} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setReviewModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              提交评价
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Orders
