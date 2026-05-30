import React from 'react'
import { Table, Tag, Button, message, Descriptions, Modal, Row, Col, Statistic, Empty } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { updateOrder, selectOrderStats } from '@/store/slices/orderSlice'
import { getStatusInfo } from '@/utils/order'
import LoadingWrapper from '@/components/LoadingWrapper'
import {
  ClockCircleOutlined, EnvironmentOutlined, PhoneOutlined,
  UserOutlined, MessageOutlined
} from '@ant-design/icons'

const WorkerOrders = () => {
  const dispatch = useDispatch()
  const { orders, loading } = useSelector(state => state.order)
  const stats = useSelector(selectOrderStats)

  const handleAccept = (order) => {
    Modal.confirm({
      title: '确认接单',
      content: `确定要接此订单吗？\n服务：${order.serviceName}\n时间：${order.appointmentTime}`,
      okText: '确认接单',
      okType: 'primary',
      cancelText: '取消',
      onOk() {
        dispatch(updateOrder({ id: order.id, status: 'accepted' }))
        message.success('接单成功')
      }
    })
  }

  const handleStart = (order) => {
    Modal.confirm({
      title: '确认开始服务',
      content: '请确认已到达服务地点并准备好工具',
      okText: '开始服务',
      okType: 'primary',
      cancelText: '取消',
      onOk() {
        dispatch(updateOrder({ id: order.id, status: 'in_progress' }))
        message.success('已开始服务')
      }
    })
  }

  const handleComplete = (order) => {
    Modal.confirm({
      title: '确认完成服务',
      content: '请确认服务已全部完成，用户已验收',
      okText: '完成服务',
      okType: 'primary',
      cancelText: '取消',
      onOk() {
        dispatch(updateOrder({
          id: order.id,
          status: 'completed',
          completeTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
        }))
        message.success('服务已完成')
      }
    })
  }

  const handleViewDetail = (record) => {
    Modal.info({
      title: '订单详情',
      width: 500,
      content: (
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="订单编号">{record.id}</Descriptions.Item>
          <Descriptions.Item label="服务项目">
            {record.serviceName} - {record.serviceType}
          </Descriptions.Item>
          <Descriptions.Item label="预约时间">{record.appointmentTime}</Descriptions.Item>
          <Descriptions.Item label="客户地址">{record.address}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{record.phone}</Descriptions.Item>
          <Descriptions.Item label="服务费用">
            <span className="text-red-500 font-semibold">¥{record.price}</span>
          </Descriptions.Item>
          <Descriptions.Item label="订单状态">
            <Tag color={getStatusInfo(record.status).color}>
              {getStatusInfo(record.status).text}
            </Tag>
          </Descriptions.Item>
          {record.remark && (
            <Descriptions.Item label="备注">{record.remark}</Descriptions.Item>
          )}
        </Descriptions>
      )
    })
  }

  const columns = [
    {
      title: '订单信息',
      key: 'orderInfo',
      render: (_, record) => (
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-xl">
            {record.serviceName.includes('空调') && '❄️'}
            {record.serviceName.includes('油烟机') && '🔥'}
            {record.serviceName.includes('冰箱') && '⚡'}
            {record.serviceName.includes('洗衣机') && '🧺'}
            {record.serviceName.includes('热水器') && '🌡️'}
            {record.serviceName.includes('微波炉') && '📻'}
          </div>
          <div>
            <div className="font-medium">{record.serviceName}</div>
            <div className="text-sm text-gray-500">{record.serviceType}</div>
            <div className="text-xs text-gray-400 mt-1">{record.id}</div>
          </div>
        </div>
      )
    },
    {
      title: '客户信息',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-1 text-sm">
            <PhoneOutlined className="text-gray-400" />
            <span>{record.phone}</span>
          </div>
          <div className="flex items-start gap-1 text-sm text-gray-500 mt-1">
            <EnvironmentOutlined className="text-gray-400 mt-1" />
            <span className="truncate max-w-[150px]" title={record.address}>
              {record.address}
            </span>
          </div>
        </div>
      )
    },
    {
      title: '预约时间',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
      width: 160,
      render: (time) => (
        <div className="flex items-center gap-1">
          <ClockCircleOutlined className="text-gray-400" />
          <span className="text-sm">{time}</span>
        </div>
      )
    },
    {
      title: '金额',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => (
        <span className="text-red-500 font-semibold">¥{price}</span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const info = getStatusInfo(status)
        return (
          <Tag color={info.color} className="text-sm px-3 py-1">
            {info.text}
          </Tag>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <Button type="primary" size="small" onClick={() => handleAccept(record)}>
              接单
            </Button>
          )}
          {record.status === 'accepted' && (
            <Button type="primary" size="small" onClick={() => handleStart(record)}>
              开始服务
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button type="primary" size="small" onClick={() => handleComplete(record)}>
              完成服务
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="worker-orders">
      <Card bordered={false} className="mb-4">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="全部订单"
              value={stats.total}
              valueStyle={{ color: '#1677ff' }}
              prefix={<MessageOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="待接单"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="服务中"
              value={stats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix="✅"
            />
          </Col>
        </Row>
      </Card>

      <Card bordered={false}>
        <h3 className="text-lg font-semibold mb-4">服务订单</h3>
        <LoadingWrapper loading={loading}>
          {orders.length > 0 ? (
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 条订单`
              }}
            />
          ) : (
            <Empty
              description="暂无服务订单"
              style={{ padding: '40px 0' }}
            />
          )}
        </LoadingWrapper>
      </Card>
    </div>
  )
}

export default WorkerOrders
