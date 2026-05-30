import React from 'react'
import { Card, List, Rate, Avatar, Tag } from 'antd'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import EmptyState from '@/components/Common/EmptyState'

const Reviews = () => {
  const navigate = useNavigate()
  const { services } = useSelector((state) => state.service)
  const { currentUser } = useSelector((state) => state.user)

  const allReviews = []
  services.forEach((service) => {
    service.reviews?.forEach((review) => {
      if (review.user === currentUser?.name) {
        allReviews.push({
          ...review,
          serviceId: service.id,
          serviceName: service.name,
          serviceImage: service.image
        })
      }
    })
  })

  return (
    <div className="reviews-page">
      <div className="section-container">
        <div className="page-header">
          <h1 className="page-title">我的评价</h1>
          <span className="count-badge">共 {allReviews.length} 条评价</span>
        </div>

        {allReviews.length > 0 ? (
          <Card>
            <List
              dataSource={allReviews}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  onClick={() => navigate(`/service/${item.serviceId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={
                      <div className="review-title">
                        <span className="service-name">{item.serviceName}</span>
                        <span className="review-time">{item.time}</span>
                      </div>
                    }
                    description={
                      <div className="review-content">
                        <Rate disabled value={item.rating} allowHalf size="small" />
                        <p>{item.content}</p>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        ) : (
          <EmptyState
            description="暂无评价记录"
            actionText="去看看服务"
            onAction={() => navigate('/services')}
          />
        )}
      </div>
    </div>
  )
}

export default Reviews
