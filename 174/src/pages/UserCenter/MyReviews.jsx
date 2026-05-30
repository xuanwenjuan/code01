import React, { useMemo } from 'react'
import { List, Rate, Tag, Avatar, Card, Row, Col, Statistic, Empty, Button } from 'antd'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getStatusInfo } from '@/utils/order'
import { StarOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons'

const MyReviews = () => {
  const navigate = useNavigate()
  const { orders } = useSelector(state => state.order)
  
  const reviewedOrders = useMemo(() => {
    return orders.filter(o => o.review)
  }, [orders])

  const stats = useMemo(() => {
    const totalReviews = reviewedOrders.length
    const avgRating = totalReviews > 0
      ? (reviewedOrders.reduce((sum, o) => sum + o.review.rating, 0) / totalReviews).toFixed(1)
      : 0
    const fiveStarCount = reviewedOrders.filter(o => o.review.rating === 5).length
    
    return { totalReviews, avgRating, fiveStarCount }
  }, [reviewedOrders])

  if (reviewedOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <Empty
          description="暂无评价"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <div className="text-gray-500 mb-4">完成服务后可以对师傅的服务进行评价</div>
          <Button type="primary" onClick={() => navigate('/user/orders')}>
            查看我的订单
          </Button>
        </Empty>
      </div>
    )
  }

  return (
    <div className="my-reviews">
      <Card bordered={false} className="mb-4">
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="累计评价"
              value={stats.totalReviews}
              valueStyle={{ color: '#1677ff' }}
              prefix={<MessageOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="平均评分"
              value={stats.avgRating}
              valueStyle={{ color: '#faad14' }}
              prefix={<StarOutlined />}
              suffix="分"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="五星好评"
              value={stats.fiveStarCount}
              valueStyle={{ color: '#52c41a' }}
              prefix="⭐"
            />
          </Col>
        </Row>
      </Card>

      <Card bordered={false}>
        <h3 className="text-lg font-semibold mb-4">我的评价</h3>
        <List
          itemLayout="vertical"
          dataSource={reviewedOrders}
          renderItem={(order) => (
            <List.Item key={order.id} className="!border-b !pb-6 !mb-6 last:border-b-0 last:mb-0 last:pb-0">
              <div className="review-header">
                <div className="review-service">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-xl mr-3">
                    {order.serviceName.includes('空调') && '❄️'}
                    {order.serviceName.includes('油烟机') && '🔥'}
                    {order.serviceName.includes('冰箱') && '⚡'}
                    {order.serviceName.includes('洗衣机') && '🧺'}
                    {order.serviceName.includes('热水器') && '🌡️'}
                    {order.serviceName.includes('微波炉') && '📻'}
                  </div>
                  <div>
                    <h4 className="font-medium">{order.serviceName}</h4>
                    <p className="text-sm text-gray-500">{order.serviceType}</p>
                  </div>
                </div>
                <Tag color="success">已评价</Tag>
              </div>
              
              <div className="review-content mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Rate disabled value={order.review.rating} />
                    <span className="text-sm text-gray-500">
                      {order.review.rating === 5 ? '非常满意' : 
                       order.review.rating === 4 ? '满意' : 
                       order.review.rating === 3 ? '一般' : 
                       order.review.rating === 2 ? '不满意' : '非常不满意'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <ClockCircleOutlined />
                    {order.review.createTime}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{order.review.content}</p>
                </div>
              </div>
              
              {order.worker && (
                <div className="review-worker mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar size={40} src={order.worker.avatar} />
                    <div>
                      <p className="font-medium">{order.worker.name}</p>
                      <p className="text-sm text-gray-500">{order.worker.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">订单金额</p>
                    <p className="text-lg font-semibold text-red-500">¥{order.price}</p>
                  </div>
                </div>
              )}
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default MyReviews
