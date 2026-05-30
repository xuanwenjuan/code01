import { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Table, Tag, Button, Space, Empty, Modal, Form, Rate, Input, message, Tabs } from 'antd'
import { EyeOutlined, StarOutlined } from '@ant-design/icons'
import { orderStatusMap } from '@/mock/data'
import { addReview, updateOrderStatus } from '@/store/slices/orderSlice'

const { TextArea } = Input

function UserOrders() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.user)
  const { orders } = useSelector((state) => state.order)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [form] = Form.useForm()

  const userOrders = useMemo(() => {
    if (!currentUser) return []
    return orders.filter((o) => o.userId === currentUser.id)
  }, [orders, currentUser])

  const handleReview = (order) => {
    setSelectedOrder(order)
    setReviewModalVisible(true)
  }

  const handleReviewSubmit = async () => {
    try {
      const values = await form.validateFields()
      dispatch(
        addReview({
          orderId: selectedOrder.id,
          rating: values.rating,
          content: values.content,
        })
      )
      message.success('评价成功！')
      setReviewModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('评价失败:', error)
    }
  }

  const handleCancelOrder = (orderId) => {
    Modal.confirm({
      title: '确认取消订单',
      content: '确定要取消这个订单吗？',
      onOk: () => {
        dispatch(updateOrderStatus({ orderId, status: 'cancelled' }))
        message.success('订单已取消')
      },
    })
  }

  const columns = [
    {
      title: '订单信息',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ color: '#999', fontSize: 12 }}>订单号：{record.orderNo}</div>
        </div>
      ),
    },
    {
      title: '服务人员',
      dataIndex: 'cleanerName',
      key: 'cleanerName',
    },
    {
      title: '预约时间',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
    },
    {
      title: '服务地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '金额',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥{price}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusInfo = orderStatusMap[status] || { text: status, color: 'default' }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'completed' && !record.review && (
            <Button type="primary" size="small" onClick={() => handleReview(record)}>
              去评价
            </Button>
          )}
          {record.status === 'pending' && (
            <Button size="small" danger onClick={() => handleCancelOrder(record.id)}>
              取消订单
            </Button>
          )}
          {record.review && (
            <Space size={4}>
              <Rate disabled defaultValue={record.review.rating} style={{ fontSize: 12 }} />
              <EyeOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
            </Space>
          )}
        </Space>
      ),
    },
  ]

  const tabItems = [
    { key: 'all', label: '全部订单' },
    { key: 'pending', label: '待确认' },
    { key: 'confirmed', label: '已确认' },
    { key: 'completed', label: '已完成' },
  ]

  const [activeTab, setActiveTab] = useState('all')

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return userOrders
    return userOrders.filter((o) => o.status === activeTab)
  }, [userOrders, activeTab])

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>我的订单</h2>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      <Card>
        {filteredOrders.length > 0 ? (
          <Table
            dataSource={filteredOrders}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="暂无订单" className="empty-state" />
        )}
      </Card>

      <Modal
        title="服务评价"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onOk={handleReviewSubmit}
        okText="提交评价"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="rating"
            label="服务评分"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="content"
            label="评价内容"
            rules={[{ required: true, message: '请输入评价内容' }]}
          >
            <TextArea rows={4} placeholder="请分享您的服务体验..." maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserOrders
