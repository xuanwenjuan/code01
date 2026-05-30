import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Tag, Space, Button, Modal, message, Select } from 'antd'
import {
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { fetchOrders, updateOrderStatus } from '../../store/actions/orderActions'
import PageContainer from '../../components/common/PageContainer'

const { Option } = Select

const orderStatusMap = {
  pending: { text: '待接单', color: 'orange' },
  confirmed: { text: '已接单', color: 'blue' },
  processing: { text: '服务中', color: 'processing' },
  completed: { text: '已完成', color: 'success' },
  cancelled: { text: '已取消', color: 'error' }
}

const MasterOrders = () => {
  const dispatch = useDispatch()
  const { orders, loading } = useSelector(state => state.orders)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter)

  const handleAcceptOrder = async (orderId) => {
    const result = await dispatch(updateOrderStatus(orderId, 'confirmed'))
    if (result.success) {
      message.success('接单成功')
    }
  }

  const handleStartService = async (orderId) => {
    const result = await dispatch(updateOrderStatus(orderId, 'processing'))
    if (result.success) {
      message.success('已开始服务')
    }
  }

  const handleCompleteOrder = async (orderId) => {
    Modal.confirm({
      title: '确认完成服务',
      content: '确认该订单服务已完成？',
      onOk: async () => {
        const result = await dispatch(updateOrderStatus(orderId, 'completed'))
        if (result.success) {
          message.success('订单已完成')
        }
      }
    })
  }

  const handleContactCustomer = (phone) => {
    message.info(`正在拨打客户电话: ${phone}`)
  }

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      width: 160,
      render: (id) => <span style={{ fontFamily: 'monospace' }}>{id}</span>
    },
    {
      title: '服务项目',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 120
    },
    {
      title: '客户信息',
      key: 'customer',
      render: (_, record) => (
        <div>
          <p style={{ margin: 0 }}>{record.customerName} - {record.phone}</p>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 13 }}>
            <EnvironmentOutlined /> {record.address}
          </p>
        </div>
      )
    },
    {
      title: '预约时间',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
      width: 160,
      render: (time) => (
        <span>
          <ClockCircleOutlined /> {time}
        </span>
      )
    },
    {
      title: '金额',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>¥{price}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusInfo = orderStatusMap[status]
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleAcceptOrder(record.id)}
            >
              接单
            </Button>
          )}
          {record.status === 'confirmed' && (
            <>
              <Button
                size="small"
                icon={<PhoneOutlined />}
                onClick={() => handleContactCustomer(record.phone)}
              >
                联系客户
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={() => handleStartService(record.id)}
              >
                开始服务
              </Button>
            </>
          )}
          {record.status === 'processing' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleCompleteOrder(record.id)}
            >
              完成服务
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <PageContainer loading={loading} empty={!loading && filteredOrders.length === 0}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>订单管理</h2>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 140 }}
        >
          <Option value="all">全部订单</Option>
          <Option value="pending">待接单</Option>
          <Option value="confirmed">已接单</Option>
          <Option value="processing">服务中</Option>
          <Option value="completed">已完成</Option>
        </Select>
      </div>
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
    </PageContainer>
  )
}

export default MasterOrders
