import React, { useState } from 'react'
import { Card, Table, Tag, Button, Space, Modal, Tabs, message, Empty } from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { cancelOrder, updateOrderStatus } from '@/store/slices/orderSlice'
import dayjs from 'dayjs'

const { TabPane } = Tabs
const { confirm } = Modal

const Orders = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { orders } = useSelector((state) => state.order)
  const { currentUser } = useSelector((state) => state.user)
  const [activeTab, setActiveTab] = useState('all')

  const userOrders = orders.filter((o) => o.userId === currentUser?.id)

  const statusMap = {
    pending: { text: '待处理', color: 'orange', icon: <ClockCircleOutlined /> },
    processing: { text: '进行中', color: 'blue', icon: <ExclamationCircleOutlined /> },
    completed: { text: '已完成', color: 'green', icon: <CheckCircleOutlined /> },
    cancelled: { text: '已取消', color: 'red', icon: <CloseCircleOutlined /> }
  }

  const filteredOrders =
    activeTab === 'all' ? userOrders : userOrders.filter((o) => o.status === activeTab)

  const handleCancelOrder = (orderId) => {
    confirm({
      title: '确认取消订单？',
      content: '取消后将无法恢复，是否继续？',
      onOk: () => {
        dispatch(cancelOrder(orderId))
        message.success('订单已取消')
      }
    })
  }

  const handleViewDetail = (order) => {
    navigate(`/service/${order.serviceId}`)
  }

  const handleMarkComplete = (orderId) => {
    dispatch(updateOrderStatus({ id: orderId, status: 'completed' }))
    message.success('订单已完成')
  }

  const columns = [
    {
      title: '服务信息',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (text, record) => (
        <div className="order-service">
          <div className="order-image" style={{ backgroundColor: record.serviceColor || '#1677ff' }}>
            {text.charAt(0)}
          </div>
          <div className="order-info">
            <p className="service-name">{text}</p>
            <p className="shop-name">{record.shopName}</p>
          </div>
        </div>
      )
    },
    {
      title: '预约时间',
      dataIndex: 'date',
      key: 'date',
      render: (date, record) => (
        <div>
          <p>{date}</p>
          <p className="time-slot">{record.timeSlot}</p>
        </div>
      )
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName',
      render: (text, record) => (
        <div>
          <p>{text}</p>
          <p className="contact-phone">{record.contactPhone}</p>
        </div>
      )
    },
    {
      title: '金额',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="order-price">¥{price}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusInfo = statusMap[status]
        return (
          <Tag color={statusInfo.color}>
            {statusInfo.icon} {statusInfo.text}
          </Tag>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelOrder(record.id)}
            >
              取消订单
            </Button>
          )}
          {record.status === 'processing' && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleMarkComplete(record.id)}
            >
              确认完成
            </Button>
          )}
        </Space>
      )
    }
  ]

  const tabItems = [
    { key: 'all', label: '全部订单' },
    { key: 'pending', label: '待处理' },
    { key: 'processing', label: '进行中' },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' }
  ]

  return (
    <div className="orders-page">
      <div className="section-container">
        <div className="page-header">
          <h1 className="page-title">我的订单</h1>
        </div>

        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

          {filteredOrders.length > 0 ? (
            <Table
              dataSource={filteredOrders}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          ) : (
            <Empty description="暂无订单" />
          )}
        </Card>
      </div>
    </div>
  )
}

export default Orders
