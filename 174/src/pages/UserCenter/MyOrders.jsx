import React, { useState } from 'react'
import {
  Table, Tag, Button, Modal, Rate, Input, message, Tabs,
  Card, Row, Col, Statistic, Avatar, Popconfirm, Descriptions,
  Space, Empty
} from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  cancelOrder, addReview, setFilter, selectFilteredOrders,
  selectOrderStats, submitReviewThunk
} from '@/store/slices/orderSlice'
import { getStatusInfo } from '@/utils/order'
import LoadingWrapper from '@/components/LoadingWrapper'
import {
  ClockCircleOutlined, EnvironmentOutlined, PhoneOutlined,
  UserOutlined, StarOutlined, MessageOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'

const { TextArea } = Input

const MyOrders = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const orders = useSelector(selectFilteredOrders)
  const stats = useSelector(selectOrderStats)
  const { loading } = useSelector(state => state.order)
  const { userInfo } = useSelector(state => state.user)
  
  const [reviewModal, setReviewModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [rating, setRating] = useState(5)
  const [reviewContent, setReviewContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleReview = (order) => {
    setCurrentOrder(order)
    setRating(5)
    setReviewContent('')
    setReviewModal(true)
  }

  const handleViewDetail = (order) => {
    setCurrentOrder(order)
    setDetailModal(true)
  }

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) {
      message.warning('请输入评价内容')
      return
    }

    setSubmitting(true)
    try {
      const review = {
        rating,
        content: reviewContent,
        images: [],
        createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      }
      
      const resultAction = await dispatch(submitReviewThunk({
        orderId: currentOrder.id,
        review
      }))
      
      if (submitReviewThunk.fulfilled.match(resultAction)) {
        message.success('评价成功，感谢您的反馈！')
        setReviewModal(false)
      } else {
        message.error(resultAction.payload || '评价失败，请重试')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelOrder = (orderId) => {
    Modal.confirm({
      title: '确认取消订单',
      icon: <ExclamationCircleOutlined />,
      content: '取消后该订单将无法恢复，确定要取消吗？',
      okText: '确认取消',
      okType: 'danger',
      cancelText: '再想想',
      onOk() {
        dispatch(cancelOrder(orderId))
        message.success('订单已取消')
      }
    })
  }

  const handleTabChange = (key) => {
    dispatch(setFilter(key))
  }

  const columns = [
    {
      title: '订单信息',
      key: 'orderInfo',
      render: (_, record) => (
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
            {record.serviceName.includes('空调') && '❄️'}
            {record.serviceName.includes('油烟机') && '🔥'}
            {record.serviceName.includes('冰箱') && '⚡'}
            {record.serviceName.includes('洗衣机') && '🧺'}
            {record.serviceName.includes('热水器') && '🌡️'}
            {record.serviceName.includes('微波炉') && '📻'}
          </div>
          <div>
            <div className="font-medium text-base">{record.serviceName}</div>
            <div className="text-sm text-gray-500">{record.serviceType}</div>
            <div className="text-xs text-gray-400 mt-1">订单号：{record.id}</div>
          </div>
        </div>
      )
    },
    {
      title: '预约信息',
      key: 'appointment',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-1 text-sm">
            <ClockCircleOutlined className="text-gray-400" />
            <span>{record.appointmentTime}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <EnvironmentOutlined className="text-gray-400" />
            <span className="truncate max-w-[160px]" title={record.address}>
              {record.address}
            </span>
          </div>
        </div>
      )
    },
    {
      title: '服务师傅',
      dataIndex: 'worker',
      key: 'worker',
      width: 180,
      render: (worker) => (
        <div className="flex items-center gap-2">
          {worker && (
            <>
              <Avatar size={32} src={worker.avatar}>
                <UserOutlined />
              </Avatar>
              <div>
                <div className="text-sm font-medium">{worker.name}</div>
                <div className="text-xs text-gray-400">{worker.phone}</div>
              </div>
            </>
          )}
        </div>
      )
    },
    {
      title: '金额',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => (
        <span className="text-red-500 font-semibold text-lg">¥{price}</span>
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
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === 'completed' && !record.review && (
            <Button type="primary" size="small" onClick={() => handleReview(record)}>
              去评价
            </Button>
          )}
          {record.status === 'pending' && (
            <Button type="link" size="small" danger onClick={() => handleCancelOrder(record.id)}>
              取消订单
            </Button>
          )}
        </Space>
      )
    }
  ]

  const tabItems = [
    { key: 'all', label: `全部 (${stats.total})` },
    { key: 'pending', label: `待接单 (${stats.pending})` },
    { key: 'in_progress', label: `服务中 (${stats.inProgress})` },
    { key: 'completed', label: `已完成 (${stats.completed})` },
    { key: 'cancelled', label: `已取消 (${stats.cancelled})` }
  ]

  return (
    <div className="my-orders">
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
              prefix={<StarOutlined />}
            />
          </Col>
        </Row>
      </Card>

      <Card bordered={false}>
        <Tabs
          activeKey={useSelector(state => state.order.filter)}
          onChange={handleTabChange}
          items={tabItems}
          className="order-tabs"
        />
        
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
              description="暂无相关订单"
              style={{ padding: '40px 0' }}
            >
              <Button type="primary" onClick={() => navigate('/')}>
                去预约服务
              </Button>
            </Empty>
          )}
        </LoadingWrapper>
      </Card>

      <Modal
        title="订单详情"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {currentOrder && (
          <div>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="订单编号">{currentOrder.id}</Descriptions.Item>
              <Descriptions.Item label="服务项目">
                {currentOrder.serviceName} - {currentOrder.serviceType}
              </Descriptions.Item>
              <Descriptions.Item label="预约时间">{currentOrder.appointmentTime}</Descriptions.Item>
              <Descriptions.Item label="服务地址">{currentOrder.address}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentOrder.phone}</Descriptions.Item>
              <Descriptions.Item label="服务师傅">
                {currentOrder.worker ? (
                  <div className="flex items-center gap-2">
                    <Avatar size={24} src={currentOrder.worker.avatar} />
                    <span>{currentOrder.worker.name}</span>
                  </div>
                ) : '待分配'}
              </Descriptions.Item>
              <Descriptions.Item label="订单金额">
                <span className="text-red-500 font-semibold">¥{currentOrder.price}</span>
              </Descriptions.Item>
              <Descriptions.Item label="订单状态">
                <Tag color={getStatusInfo(currentOrder.status).color}>
                  {getStatusInfo(currentOrder.status).text}
                </Tag>
              </Descriptions.Item>
              {currentOrder.remark && (
                <Descriptions.Item label="备注信息">{currentOrder.remark}</Descriptions.Item>
              )}
              {currentOrder.review && (
                <Descriptions.Item label="用户评价">
                  <div>
                    <Rate disabled value={currentOrder.review.rating} />
                    <p className="mt-1 text-gray-600">{currentOrder.review.content}</p>
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title="服务评价"
        open={reviewModal}
        onCancel={() => setReviewModal(false)}
        onOk={handleSubmitReview}
        confirmLoading={submitting}
        okText="提交评价"
        cancelText="取消"
        width={500}
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-gray-500 mb-2">请对本次服务进行评分</p>
            <Rate
              value={rating}
              onChange={setRating}
              style={{ fontSize: '32px' }}
              character={({ index }) => {
                return index < rating ? '⭐' : '☆'
              }}
            />
            <p className="mt-2 text-sm text-gray-400">
              {rating === 5 ? '非常满意' : rating === 4 ? '满意' : rating === 3 ? '一般' : rating === 2 ? '不满意' : '非常不满意'}
            </p>
          </div>
          <div>
            <label className="block mb-2 font-medium">评价内容</label>
            <TextArea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="请分享您的服务体验，帮助其他用户做出更好的选择..."
              rows={4}
              maxLength={500}
              showCount
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MyOrders
