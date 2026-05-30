import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Tabs,
  Descriptions,
  Modal,
  message,
  Divider
} from 'antd'
import { EyeOutlined, CheckOutlined, PhoneOutlined } from '@ant-design/icons'
import EmptyState from '@/components/EmptyState'
import { updateOrderStatus } from '@/store/slices/orderSlice'

const statusMap = {
  0: { text: '待接单', color: 'orange' },
  1: { text: '服务中', color: 'blue' },
  2: { text: '已完成', color: 'green' },
  3: { text: '已取消', color: 'red' }
}

function MasterOrders() {
  const dispatch = useDispatch()
  const { orders } = useSelector((state) => state.order)
  const [activeTab, setActiveTab] = useState('all')
  const [detailModal, setDetailModal] = useState({ open: false, order: null })

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true
    return order.status === parseInt(activeTab)
  })

  const handleTakeOrder = (orderId) => {
    Modal.confirm({
      title: '确认接单',
      content: '确定要接这个订单吗？',
      onOk: () => {
        dispatch(updateOrderStatus({ orderId, status: 1 }))
        message.success('接单成功')
      }
    })
  }

  const handleCompleteOrder = (orderId) => {
    Modal.confirm({
      title: '完成服务',
      content: '确认服务已完成吗？',
      onOk: () => {
        dispatch(updateOrderStatus({ orderId, status: 2 }))
        message.success('订单已完成')
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
      title: '客户信息',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div>{record.userName}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{record.userPhone}</div>
        </div>
      )
    },
    {
      title: '服务地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true
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
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => setDetailModal({ open: true, order: record })}
          >
            详情
          </Button>
          {record.status === 0 && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleTakeOrder(record.id)}
            >
              接单
            </Button>
          )}
          {record.status === 1 && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleCompleteOrder(record.id)}
            >
              完成
            </Button>
          )}
          {record.userPhone && (
            <Button
              type="link"
              icon={<PhoneOutlined />}
              onClick={() => message.info(`正在拨打 ${record.userPhone}...`)}
            >
              联系
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
    { key: '2', label: '已完成' }
  ]

  return (
    <div className="container">
      <Card>
        <h2 style={{ marginBottom: 24 }}>师傅订单</h2>
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
          <EmptyState description="暂无订单" />
        )}
      </Card>

      <Modal
        title="订单详情"
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, order: null })}
        footer={null}
        width={600}
      >
        {detailModal.order && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Tag color={statusMap[detailModal.order.status].color} style={{ fontSize: 16, padding: '4px 16px' }}>
                {statusMap[detailModal.order.status].text}
              </Tag>
              <h3 style={{ marginTop: 16 }}>{detailModal.order.serviceName}</h3>
            </div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="客户姓名">{detailModal.order.userName}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{detailModal.order.userPhone}</Descriptions.Item>
              <Descriptions.Item label="服务地址">{detailModal.order.address}</Descriptions.Item>
              <Descriptions.Item label="预约时间">{detailModal.order.appointmentTime}</Descriptions.Item>
              <Descriptions.Item label="问题描述">{detailModal.order.remark || '无'}</Descriptions.Item>
              <Descriptions.Item label="订单金额">
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{detailModal.order.price}</span>
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Space>
                {detailModal.order.status === 0 && (
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      handleTakeOrder(detailModal.order.id)
                      setDetailModal({ open: false, order: null })
                    }}
                  >
                    立即接单
                  </Button>
                )}
                {detailModal.order.status === 1 && (
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      handleCompleteOrder(detailModal.order.id)
                      setDetailModal({ open: false, order: null })
                    }}
                  >
                    完成服务
                  </Button>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MasterOrders
