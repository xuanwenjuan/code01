import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Card, List, Rate, Avatar } from 'antd'
import EmptyState from '@/components/Common/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils'

const Reviews = () => {
  const { currentUser } = useAuth()
  const { services } = useSelector(state => state.service)

  const myReviews = useMemo(() => {
    const reviews = []
    services.forEach(service => {
      service.reviews?.forEach(review => {
        if (review.userId === currentUser?.id) {
          reviews.push({
            ...review,
            serviceName: service.name,
            serviceImage: service.image,
            serviceId: service.id
          })
        }
      })
    })
    return reviews.sort((a, b) => new Date(b.time) - new Date(a.time))
  }, [services, currentUser])

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>我的评价</h1>
          <p>查看您发表过的所有评价</p>
        </div>
      </div>

      <div className="container page-content">
        <Card className="card-shadow">
          {myReviews.length > 0 ? (
            <List
              dataSource={myReviews}
              renderItem={(review) => (
                <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <List.Item.Meta
                    avatar={<img src={review.serviceImage} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{review.serviceName}</span>
                        <span style={{ color: '#999', fontSize: 12 }}>{formatDate(review.time)}</span>
                      </div>
                    }
                    description={
                      <div style={{ marginTop: 8 }}>
                        <Rate disabled value={review.rating} style={{ fontSize: 14, marginBottom: 8 }} />
                        <div style={{ color: '#666' }}>{review.content}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <EmptyState description="还没有发表过评价" />
          )}
        </Card>
      </div>
    </div>
  )
}

export default Reviews
