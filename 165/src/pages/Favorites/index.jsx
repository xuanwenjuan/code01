import { useSelector, useDispatch } from 'react-redux'
import { Card, Row, Col, Button, Empty, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { HeartFilled } from '@ant-design/icons'
import { toggleFavorite } from '@/store/slices/userSlice'

const Favorites = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { favorites } = useSelector(state => state.user)
  const { services } = useSelector(state => state.service)

  const favoriteServices = services.filter(service => favorites.includes(service.id))

  const handleRemoveFavorite = (serviceId, e) => {
    e.stopPropagation()
    dispatch(toggleFavorite(serviceId))
    message.success('已取消收藏')
  }

  return (
    <div>
      <Card bordered={false} title="我的收藏">
        {favoriteServices.length > 0 ? (
          <Row gutter={[16, 16]}>
            {favoriteServices.map(service => (
              <Col xs={24} sm={12} lg={8} key={service.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={service.name}
                      src={service.image}
                      style={{ height: 160, objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => navigate(`/service/${service.id}`)}
                    />
                  }
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<HeartFilled style={{ color: '#ff4d4f' }} />}
                      onClick={(e) => handleRemoveFavorite(service.id, e)}
                    >
                      取消收藏
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={
                      <div onClick={() => navigate(`/service/${service.id}`)} style={{ cursor: 'pointer' }}>
                        {service.name}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                          ¥{service.price}
                          <span style={{ fontSize: 12, color: '#999', fontWeight: 'normal' }}>
                            /{service.priceUnit}
                          </span>
                        </div>
                        <div style={{ color: '#666', fontSize: 12 }}>
                          评分：{service.rating} | 销量：{service.orderCount}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无收藏的服务" />
        )}
      </Card>
    </div>
  )
}

export default Favorites
