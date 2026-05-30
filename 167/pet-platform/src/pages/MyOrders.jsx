import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Card, Tabs, List, Tag, Button, Image, Space, Empty, Rate, Modal, Form, Input,
} from 'antd'
import {
  EyeOutlined, CommentOutlined,
} from '@ant-design/icons'
import PageState from '@/components/common/PageState'
import { formatPrice, formatDateTime, getOrderStatusText, getOrderStatusColor } from '@/utils'
import { useDispatch } from 'react-redux'
import { addReview } from '@/store/slices/orderSlice'
import { StarOutlined } from '@ant-design/icons'
import { validateRequired } from '@/utils/validate'

const { TabPane } = Tabs
const { TextArea } = Input

const MyOrders = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.user)
  const { orders } = useSelector((state) => state.order)
  const [activeTab, setActiveTab] = useState('all')
  const [reviewModal, setReviewModal] = useState(false)
  const [reviewOrder, setReviewOrder] = useState(null)
  const [reviewForm] = Form.useForm()

  const filteredOrders = useMemo(() => {
    let result = orders.filter((o) => o.userId === currentUser?.id)
    if (activeTab !== 'all') {
      result = result.filter((o) => o.status === activeTab)
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [orders, currentUser, activeTab])

  const handleReview = (order) => {
    setReviewOrder(order)
    setReviewModal(true)
    reviewForm.resetFields()
  }

  const submitReview = async () => {
    try {
      const values = await reviewForm.validateFields()
      dispatch(addReview({
        orderId: reviewOrder.id,
        review: {
          rating: values.rating,
          content: values.content,
          createdAt: new Date().toISOString(),
        },
      }))
      setReviewModal(false)
      setReviewOrder(null)
    } catch (error) {
      console.log('Review failed:', error)
    }
  }

  const tabList = [
    { key: 'all', label: '全部订单' },
    { key: 'pending', label: '待确认' },
    { key: 'confirmed', label: '已确认' },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' },
  ]

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {tabList.map((tab) => (
            <TabPane tab={tab.label} key={tab.key}>
              <PageState data={filteredOrders} emptyText="暂无订单">
                <List
                  dataSource={filteredOrders}
                  renderItem={(order) => (
                    <List.Item style={{ padding: '16px 0' }}>
                      <Card style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                          <Space>
                            <span style={{ color: '#999' }}>订单号：{order.orderNo}</span>
                            <span style={{ color: '#999' }}>{formatDateTime(order.createdAt)}</span>
                          </Space>
                          <Tag color={getOrderStatusColor(order.status)}>
                            {getOrderStatusText(order.status)}
                          </Tag>
                        </div>

                        <div style={{ display: 'flex', gap: 16 }}>
                          <Image
                            src={order.serviceImage}
                            width={120}
                            height={90}
                            style={{ borderRadius: 6, objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: 8 }}>{order.serviceName}</h3>
                            <div style={{ color: '#666', fontSize: 13, marginBottom: 4 }}>
                              宠物：{order.petName} | 预约时间：{formatDateTime(order.appointmentTime)}
                            </div>
                            <div style={{ color: '#666', fontSize: 13 }}>
                              服务人员：{order.groomerName || '待分配'}
                            </div>
                            {order.review && (
                              <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                  <Rate disabled value={order.review.rating} style={{ fontSize: 12 }} />
                                  <span style={{ color: '#999', fontSize: 12 }}>
                                    {formatDateTime(order.review.createdAt)}
                                  </span>
                                </div>
                                <div style={{ color: '#666', fontSize: 13 }}>{order.review.content}</div>
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#ff6b35', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
                              {formatPrice(order.totalPrice)}
                            </div>
                            <Space>
                              <Button
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => navigate(`/order/${order.id}`)}
                              >
                                详情
                              </Button>
                              {order.status === 'completed' && !order.review && (
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<CommentOutlined />}
                                  onClick={() => handleReview(order)}
                                >
                                  评价
                                </Button>
                              )}
                            </Space>
                          </div>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              </PageState>
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <Modal
        title="服务评价"
        open={reviewModal}
        onCancel={() => setReviewModal(false)}
        onOk={submitReview}
        okText="提交评价"
      >
        <Form form={reviewForm} layout="vertical">
          <Form.Item
            name="rating"
            label="评分"
            rules={[{ validator: validateRequired('请选择评分') }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="content"
            label="评价内容"
            rules={[{ validator: validateRequired('请输入评价内容') }]}
          >
            <TextArea rows={4} placeholder="请输入您的评价" maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MyOrders
