import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Card, Typography, Space, Tag } from 'antd'
import {
  UserOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  StarOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import UserOrders from './user/Orders'
import UserAddresses from './user/Addresses'
import UserReviews from './user/Reviews'

const { Sider, Content } = Layout
const { Title, Text } = Typography

function UserCenter() {
  const location = useLocation()
  const { currentUser } = useSelector((state) => state.user)

  const selectedKey = location.pathname.split('/').pop() || 'profile'

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/user/profile">个人中心</Link>,
    },
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: <Link to="/user/orders">我的订单</Link>,
    },
    {
      key: 'addresses',
      icon: <EnvironmentOutlined />,
      label: <Link to="/user/addresses">常用地址</Link>,
    },
    {
      key: 'reviews',
      icon: <StarOutlined />,
      label: <Link to="/user/reviews">我的评价</Link>,
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
            <Tag color="blue" style={{ marginLeft: 8 }}>普通用户</Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {currentUser?.phone}
          </Text>
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
                <Title level={3} style={{ marginTop: 0 }}>个人中心</Title>
                <Card>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      <Avatar src={currentUser?.avatar} size={80} icon={<UserOutlined />} />
                      <div>
                        <Title level={4} style={{ margin: '0 0 8px 0' }}>{currentUser?.name}</Title>
                        <Text type="secondary">手机号：{currentUser?.phone}</Text>
                        <br />
                        <Text type="secondary">
                          注册时间：{new Date(currentUser?.registerTime).toLocaleDateString()}
                        </Text>
                      </div>
                    </div>
                  </Space>
                </Card>

                <div style={{ marginTop: 24 }}>
                  <Title level={4}>快捷入口</Title>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Link to="/user/orders">
                      <Card hoverable style={{ width: 160, textAlign: 'center' }}>
                        <ShoppingOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                        <div>我的订单</div>
                      </Card>
                    </Link>
                    <Link to="/user/addresses">
                      <Card hoverable style={{ width: 160, textAlign: 'center' }}>
                        <EnvironmentOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                        <div>常用地址</div>
                      </Card>
                    </Link>
                    <Link to="/">
                      <Card hoverable style={{ width: 160, textAlign: 'center' }}>
                        <HomeOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
                        <div>去预约服务</div>
                      </Card>
                    </Link>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="orders" element={<UserOrders />} />
          <Route path="addresses" element={<UserAddresses />} />
          <Route path="reviews" element={<UserReviews />} />
          <Route path="" element={<UserOrders />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default UserCenter
