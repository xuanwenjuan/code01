import { Layout, Menu, Avatar, Dropdown, Button, Badge } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  UserOutlined,
  ShoppingOutlined,
  ToolOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'
import CitySelector from '@/components/CitySelector'

const { Header, Content, Footer } = Layout

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, logout, isLoggedIn, isUser, isMaster } = useAuth()

  const menuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/home')
    },
    ...(isLoggedIn
      ? [
          isUser && {
            key: '/orders',
            icon: <ShoppingOutlined />,
            label: '我的订单',
            onClick: () => navigate('/orders')
          },
          isMaster && {
            key: '/master/orders',
            icon: <ToolOutlined />,
            label: '师傅订单',
            onClick: () => navigate('/master/orders')
          },
          {
            key: '/profile',
            icon: <UserOutlined />,
            label: '个人中心',
            onClick: () => navigate('/profile')
          }
        ].filter(Boolean)
      : [])
  ]

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => navigate('/profile')
      },
      {
        type: 'divider'
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: logout
      }
    ]
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
          padding: '0 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              color: '#fff',
              fontSize: 20,
              fontWeight: 'bold',
              marginRight: 40,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/home')}
          >
            🔧 同城管道疏通
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ minWidth: 0, flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CitySelector />
          {isLoggedIn ? (
            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar src={userInfo?.avatar} icon={<UserOutlined />} style={{ marginRight: 8 }} />
                <span style={{ color: '#fff' }}>{userInfo?.name}</span>
              </div>
            </Dropdown>
          ) : (
            <>
              <Button type="primary" onClick={() => navigate('/login')}>
                登录
              </Button>
              <Button ghost onClick={() => navigate('/register')}>
                注册
              </Button>
            </>
          )}
        </div>
      </Header>
      <Content>
        <div className="page-wrapper">
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#001529', color: '#fff' }}>
        同城管道疏通预约平台 ©{new Date().getFullYear()} Created with React
      </Footer>
    </Layout>
  )
}

export default AppLayout
