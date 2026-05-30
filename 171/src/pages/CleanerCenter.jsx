import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Card, Typography, Space, Tag, Rate, Statistic, Row, Col } from 'antd'
import {
  UserOutlined,
  ShoppingOutlined,
  StarOutlined,
  WalletOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import CleanerOrders from './cleaner/Orders'
import CleanerProfile from './cleaner/Profile'

const { Sider, Content } = Layout
const { Title, Text } = Typography

function CleanerCenter() {
  const location = useLocation()
  const { currentUser } = useSelector((state) => state.user)

  const selectedKey = location.pathname.split('/').pop() || 'profile'

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/cleaner/profile">工作首页</Link>,
    },
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: <Link to="/cleaner/orders">我的订单</Link>,
    },
    {
      key: 'info',
      icon: <UserOutlined />,
      label: <Link to="/cleaner/info">个人信息</Link>,
    },
  ]

  return (
    <Layout style={{ background: 'transparent', minHeight: 600 }}>
      <Sider
        width={240}
        style={{
          background: '#fff',
          borderRadius: 8,
          marginRight: 24,
          overflow: 'auto',
        }}
      >
        <div style={{ padding: 24, textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Avatar src={currentUser?.avatar} size={64} icon={<UserOutlined />} />
          <div style={{ marginTop: 12 }}>
            <Text strong style={{ fontSize: 16 }}>{currentUser?.name}</Text>
            <Tag color="green" style={{ marginLeft: 8 }}>保洁师</Tag>
          </div>
          <Space style={{ marginTop: 8 }}>
            <Rate disabled defaultValue={currentUser?.rating} style={{ fontSize: 12 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{currentUser?.rating}</Text>
          </Space>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ borderRight: 'none', padding: '12px 0' }}
        />
      </Sider>
      <Content style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
        <Routes>
          <Route
            path="profile"
            element={
              <div>
                <Title level={3} style={{ marginTop: 0 }}>工作首页</Title>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={12} md={6}>
                    <Card>
                      <Statistic
                        title="总接单量"
                        value={currentUser?.orderCount || 0}
                        prefix={<ShoppingOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12} md={6}>
                    <Card>
                      <Statistic
                        title="综合评分"
                        value={currentUser?.rating || 0}
                        precision={1}
                        prefix={<StarOutlined />}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12} md={6}>
                    <Card>
                      <Statistic
                        title="待服务"
                        value={0}
                        prefix={<WalletOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12} md={6}>
                    <Card>
                      <Statistic
                        title="服务等级"
                        value="金牌"
                        prefix={<TrophyOutlined />}
                        valueStyle={{ color: '#eb2f96' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Card title="个人简介">
                  <p style={{ color: '#666', lineHeight: 1.8 }}>
                    {currentUser?.description || '暂无简介'}
                  </p>
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">擅长技能：</Text>
                    <Space wrap style={{ marginLeft: 8 }}>
                      {currentUser?.skills?.map((skill, index) => (
                        <Tag key={index} color="green">{skill}</Tag>
                      ))}
                    </Space>
                  </div>
                </Card>
              </div>
            }
          />
          <Route path="orders" element={<CleanerOrders />} />
          <Route path="info" element={<CleanerProfile />} />
          <Route path="" element={<CleanerOrders />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default CleanerCenter
