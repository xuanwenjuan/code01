import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Avatar, Button, List, Tag, Statistic } from 'antd'
import {
  UserOutlined, ShoppingCartOutlined, HeartOutlined,
  EditOutlined, StarOutlined, SmileOutlined, LogoutOutlined
} from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'
import { getStatusText, getStatusColor } from '@/utils'

const Profile = () => {
  const navigate = useNavigate()
  const { currentUser, isMom, isNanny, handleLogout } = useAuth()
  const { orders } = useSelector(state => state.order)
  const { favorites } = useSelector(state => state.favorite)
  const { babies } = useSelector(state => state.baby)

  const myOrders = orders.filter(o => o.userId === currentUser?.id)
  const pendingOrders = myOrders.filter(o => o.status === 'pending')
  const completedOrders = myOrders.filter(o => o.status === 'completed')

  const menuItems = [
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: '我的订单',
      onClick: () => navigate('/profile/orders'),
      badge: pendingOrders.length
    },
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: '我的收藏',
      onClick: () => navigate('/profile/favorites'),
      badge: favorites.length
    },
    {
      key: 'babies',
      icon: <SmileOutlined />,
      label: '宝宝信息',
      onClick: () => navigate('/profile/babies'),
      badge: babies.length,
      showForMom: true
    },
    {
      key: 'reviews',
      icon: <StarOutlined />,
      label: '我的评价',
      onClick: () => navigate('/profile/reviews')
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '个人信息',
      onClick: () => navigate('/profile/edit')
    }
  ].filter(item => !item.showForMom || isMom)

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>个人中心</h1>
          <p>管理您的账户信息和订单</p>
        </div>
      </div>

      <div className="container page-content">
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Card className="card-shadow" style={{ marginBottom: 24 }}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Avatar size={80} src={currentUser?.avatar} style={{ marginBottom: 16 }} />
                <h2 style={{ fontSize: 20, marginBottom: 8 }}>{currentUser?.nickname}</h2>
                <div style={{ marginBottom: 16 }}>
                  {isMom && <Tag color="#ff6b9d">宝妈用户</Tag>}
                  {isNanny && <Tag color="#1890ff">母婴师</Tag>}
                </div>
                {currentUser?.realName && (
                  <div style={{ color: '#666', fontSize: 14 }}>{currentUser.realName}</div>
                )}
                {currentUser?.phone && (
                  <div style={{ color: '#666', fontSize: 14 }}>{currentUser.phone}</div>
                )}
                {isNanny && currentUser?.experience && (
                  <div style={{ color: '#666', fontSize: 14, marginTop: 8 }}>
                    从业 {currentUser.experience} 年 · 服务 {currentUser.orderCount || 0} 单
                  </div>
                )}
              </div>
            </Card>

            <Card className="card-shadow">
              <List
                dataSource={menuItems}
                renderItem={(item) => (
                  <List.Item
                    style={{ cursor: 'pointer', padding: '12px 0' }}
                    onClick={item.onClick}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <span style={{ fontSize: 18, color: '#ff6b9d' }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge > 0 && (
                        <Tag color="red">{item.badge}</Tag>
                      )}
                      <span style={{ color: '#ccc' }}>{'>'}</span>
                    </div>
                  </List.Item>
                )}
              />
              <Button
                block
                icon={<LogoutOutlined />}
                onClick={() => {
                  handleLogout()
                  navigate('/')
                }}
                style={{ marginTop: 16 }}
              >
                退出登录
              </Button>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card className="card-shadow" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Statistic title="全部订单" value={myOrders.length} />
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Statistic title="待处理" value={pendingOrders.length} valueStyle={{ color: '#faad14' }} />
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Statistic title="已完成" value={completedOrders.length} valueStyle={{ color: '#52c41a' }} />
                  </div>
                </Col>
              </Row>
            </Card>

            <Card
              className="card-shadow"
              title="最近订单"
              extra={<Button type="link" onClick={() => navigate('/profile/orders')}>查看全部</Button>}
            >
              {myOrders.length > 0 ? (
                <List
                  dataSource={myOrders.slice(0, 5)}
                  renderItem={(order) => (
                    <List.Item
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/profile/orders')}
                    >
                      <List.Item.Meta
                        avatar={<img src={order.serviceImage} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />}
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{order.serviceName}</span>
                            <Tag color={getStatusColor(order.status)}>{getStatusText(order.status)}</Tag>
                          </div>
                        }
                        description={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#999' }}>{order.serviceCycle} · {order.serviceTime}</span>
                            <span className="price-text">¥{order.price}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  暂无订单
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Profile
