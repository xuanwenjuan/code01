import React from 'react'
import { Card, Button, Avatar, List, Tag, Space, Statistic, Row, Col, Breadcrumb } from 'antd'
import {
  UserOutlined, ShoppingCartOutlined, HeartOutlined, SettingOutlined, EditOutlined,
  HomeOutlined, UserOutlined as UserIcon, CheckCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageState from '@/components/common/PageState'

const Profile = () => {
  const navigate = useNavigate()
  const { currentUser } = useSelector((state) => state.user)
  const { orders } = useSelector((state) => state.order)
  const { pets } = useSelector((state) => state.pet)
  const { favorites } = useSelector((state) => state.service)

  const userOrders = orders.filter((o) => o.userId === currentUser?.id)
  const pendingOrders = userOrders.filter((o) => o.status === 'pending' || o.status === 'confirmed')
  const completedOrders = userOrders.filter((o) => o.status === 'completed')
  const userPets = pets.filter((p) => p.userId === currentUser?.id)

  const menuItems = [
    { key: 'orders', icon: <ShoppingCartOutlined />, label: '我的订单', count: userOrders.length },
    { key: 'pets', icon: <HeartOutlined />, label: '我的宠物', count: userPets.length },
    { key: 'favorites', icon: <HeartOutlined />, label: '我的收藏', count: favorites.length },
    { key: 'settings', icon: <SettingOutlined />, label: '账号设置', count: 0 },
  ]

  const handleMenuClick = (key) => {
    const routes = {
      orders: '/orders',
      pets: '/pets',
      favorites: '/favorites',
      settings: '/profile',
    }
    navigate(routes[key])
  }

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <PageState data={null} emptyText="请先登录" />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <Breadcrumb
            items={[
              { title: <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}><HomeOutlined /> 首页</span> },
              { title: <span style={{ color: '#fff' }}><UserIcon /> 个人中心</span> },
            ]}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}
          />
          <h1 style={{ color: '#fff', fontSize: 28, margin: 0 }}>个人中心</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, marginBottom: 0 }}>
            管理您的账户信息和服务订单
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 40 }}>
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <Avatar
              size={80}
              src={currentUser.avatar}
              icon={<UserOutlined />}
              style={{ border: '3px solid #ff6b35', padding: 2 }}
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ marginBottom: 12, fontSize: 24 }}>{currentUser.nickname || currentUser.username}</h2>
              <Space wrap size="middle">
                <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                  {currentUser.userType === 'owner' ? '🐾 宠主' : '✂️ 宠物师'}
                </Tag>
                <span style={{ color: '#666' }}>📞 {currentUser.phone}</span>
                {currentUser.email && <span style={{ color: '#666' }}>📧 {currentUser.email}</span>}
              </Space>
              {currentUser.address && (
                <div style={{ color: '#666', marginTop: 12 }}>📍 {currentUser.address}</div>
              )}
            </div>
            <Button type="primary" icon={<EditOutlined />} size="large" onClick={() => navigate('/profile/edit')}>
              编辑资料
            </Button>
          </div>
        </Card>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} md={6}>
            <Card className="card-hover" style={{ borderRadius: 12 }}>
              <Statistic
                title="待服务订单"
                value={pendingOrders.length}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="card-hover" style={{ borderRadius: 12 }}>
              <Statistic
                title="已完成订单"
                value={completedOrders.length}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="card-hover" style={{ borderRadius: 12 }}>
              <Statistic
                title="我的宠物"
                value={userPets.length}
                valueStyle={{ color: '#1890ff' }}
                prefix={<HeartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="card-hover" style={{ borderRadius: 12 }}>
              <Statistic
                title="收藏服务"
                value={favorites.length}
                valueStyle={{ color: '#eb2f96' }}
                prefix={<HeartOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card style={{ borderRadius: 12 }}>
          <h3 className="section-title" style={{ marginBottom: 20 }}>功能入口</h3>
          <List
            dataSource={menuItems}
            grid={{ gutter: 16, xs: 1, sm: 2, md: 4 }}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => handleMenuClick(item.key)}
                  className="card-hover"
                  style={{ textAlign: 'center', padding: '24px 16px' }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      fontSize: 24,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
                  {item.count > 0 && (
                    <Tag color="red" style={{ margin: 0 }}>{item.count} 条</Tag>
                  )}
                </Card>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  )
}

export default Profile
