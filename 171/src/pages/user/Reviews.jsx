import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Card, List, Rate, Empty, Tag, Typography } from 'antd'
import { StarOutlined } from '@ant-design/icons'

const { Text } = Typography

function UserReviews() {
  const { currentUser } = useSelector((state) => state.user)
  const { orders } = useSelector((state) => state.order)

  const myReviews = useMemo(() => {
    if (!currentUser) return []
    return orders
      .filter((o) => o.userId === currentUser.id && o.review)
      .map((o) => ({
        ...o.review,
        orderNo: o.orderNo,
        serviceName: o.serviceName,
        cleanerName: o.cleanerName,
        createTime: o.review.time,
      }))
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
  }, [orders, currentUser])

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>我的评价</h2>
      <Card>
        {myReviews.length > 0 ? (
          <List
            dataSource={myReviews}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<StarOutlined style={{ fontSize: 24, color: '#faad14' }} />}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>{item.serviceName}</Text>
                        <Tag color="blue" style={{ marginLeft: 8 }}>{item.cleanerName}</Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(item.createTime).toLocaleString()}
                      </Text>
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Rate disabled defaultValue={item.rating} style={{ fontSize: 14 }} />
                      </div>
                      <p style={{ color: '#666', margin: 0, lineHeight: 1.6 }}>{item.content}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无评价" className="empty-state" />
        )}
      </Card>
    </div>
  )
}

export default UserReviews
