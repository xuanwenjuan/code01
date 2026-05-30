import { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Table, Tag, Button, Space, Empty, Modal, message, Tabs } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { orderStatusMap } from '@/mock/data'
import { updateOrderStatus } from '@/store/slices/orderSlice'

function CleanerOrders() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.user)
  const { orders } = useSelector((state) => state.order)

  const cleanerOrders = useMemo(() => {
    if (!currentUser) return []
    return orders.filter((o) => o.cleanerId === currentUser.id)
  }, [orders, currentUser])

  const handleConfirm = (orderId) => {
    Modal.confirm({
      title: '确认接单',
      content: '确定要接这个订单吗？',
      onOk: () => {
        dispatch(updateOrderStatus({ orderId, status: 'confirmed' }))
        message.success('已确认接单')
      },
    })
  }

  const handleStartService = (orderId) => {
    Modal.confirm({
      title: '开始服务',
      content: '确定开始服务吗？',
      onOk: () => {
        dispatch(updateOrderStatus({ orderId, status: 'in_progress' }))
        message.success('服务已开始')
      },
    })
  }

  const handleComplete = (orderId) => {
    Modal.confirm({
      title: '完成服务',
      content: '确定服务已完成吗？',
      onOk: () => {
        dispatch(updateOrderStatus({ orderId, status: 'completed' }))
        message.success('服务已完成')
      },
    })
  }

  const handleReject = (orderId) => {
    Modal.confirm({
      title: '拒绝订单',
      content: '确定要拒绝这个订单吗？',
      onOk: () => {
        dispatch(updateOrderStatus({ orderId, status: 'cancelled' }))
        message.success('已拒绝订单')
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
      title: '客户信息',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div>{record.contactName}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{record.contactPhone}</div>
        </div>
      ),
    },
    {
      title: '服务地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '预约时间',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
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
          {record.status === 'pending' && (
            <>
              <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleConfirm(record.id)}>
                接单
              </Button>
              <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleReject(record.id)}>
                拒单
              </Button>
            </>
          )}
          {record.status === 'confirmed' && (
            <Button type="primary" size="small" onClick={() => handleStartService(record.id)}>
              开始服务
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button type="primary" size="small" onClick={() => handleComplete(record.id)}>
              完成服务
            </Button>
          )}
          {record.review && (
            <Space size={4}>
              <span style={{ color: '#999', fontSize: 12 }}>客户已评价</span>
            </Space>
          )}
        </Space>
      ),
    },
  ]

  const tabItems = [
    { key: 'all', label: '全部订单' },
    { key: 'pending', label: '待接单' },
    { key: 'confirmed', label: '待服务' },
    { key: 'in_progress', label: '服务中' },
    { key: 'completed', label: '已完成' },
  ]

  const [activeTab, setActiveTab] = useState('all')

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return cleanerOrders
    return cleanerOrders.filter((o) => o.status === activeTab)
  }, [cleanerOrders, activeTab])

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
    </div>
  )
}

export default CleanerOrders
