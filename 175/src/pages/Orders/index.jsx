import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Tag, Button, Space, Tabs, Modal, message } from 'antd'
import {
  EyeOutlined,
  MessageOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { selectUserOrdersByStatus, cancelOrder } from '@/store/slices/orderSlice'
import { useAuth } from '@/hooks/useAuth'
import EmptyState from '@/components/EmptyState'
import Loading from '@/components/Loading'

const statusMap = {
  0: { text: '待接单', color: 'orange' },
  1: { text: '服务中', color: 'blue' },
  2: { text: '已完成', color: 'green' },
  3: { text: '已取消', color: 'red' }
}

function Orders() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userInfo } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(false)

  const filteredOrders = useSelector((state) =>
    selectUserOrdersByStatus(state, userInfo?.id, activeTab)
  )

  const handleCancelOrder = (orderId) => {
    Modal.confirm({
      title: '确认取消订单',
      content: '确定要取消这个订单吗？取消后无法恢复。',
      okText: '确认取消',
      okType: 'danger',
      cancelText: '再想想',
      onOk: () => {
        setLoading(true)
        setTimeout(() => {
          dispatch(cancelOrder(orderId))
          message.success('订单已取消')
          setLoading(false)
        }, 300)
      }
    })
  }

  const columns = [
    {
      title: '订单信息',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={record.serviceImage}
            alt={text}
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, marginRight: 12 }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ color: '#999', fontSize: 12 }}>
              {record.appointmentTime}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '订单金额',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>¥{price}</span>
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const s = statusMap[status]
        return <Tag color={s.color}>{s.text}</Tag>
      }
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/order/${record.id}`)}
          >
            详情
          </Button>
          {record.status === 0 && (
            <Button
              type="link"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleCancelOrder(record.id)}
              loading={loading}
            >
              取消
            </Button>
          )}
          {record.status === 2 && !record.feedback && (
            <Button
              type="link"
              icon={<MessageOutlined />}
              onClick={() => navigate(`/feedback/${record.id}`)}
            >
              评价
            </Button>
          )}
        </Space>
      )
    }
  ]

  const tabItems = [
    { key: 'all', label: '全部订单' },
    { key: '0', label: '待接单' },
    { key: '1', label: '服务中' },
    { key: '2', label: '已完成' },
    { key: '3', label: '已取消' }
  ]

  return (
    <div className="container">
      <Card>
        <h2 style={{ marginBottom: 24 }}>我的订单</h2>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
        {filteredOrders.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
          />
        ) : (
          <EmptyState description="暂无订单" actionText="去预约服务" actionPath="/home" />
        )}
      </Card>
    </div>
  )
}

export default Orders
