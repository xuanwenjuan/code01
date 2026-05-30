import { Layout, Menu, Dropdown, Avatar, Button, Space } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  HomeOutlined,
  BookOutlined,
  EditOutlined,
  HistoryOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined
} from '@ant-design/icons'
import { logout } from '../store/slices/authSlice'

const { Header, Content, Footer } = Layout

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  const menuItems = [
    { key: '/home', icon: <HomeOutlined />, label: '平台首页' },
    { key: '/techniques', icon: <BookOutlined />, label: '技艺实操' },
    { key: '/creation', icon: <EditOutlined />, label: '创作记录' },
    { key: '/kiln-culture', icon: <HistoryOutlined />, label: '窑口文化' }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const userMenuItems = [
    ...(user?.role === 'admin' ? [{
      key: 'admin',
      icon: <DashboardOutlined />,
      label: '管理后台',
      onClick: () => navigate('/admin/dashboard')
    }] : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
          <div
            style={{
              color: 'white',
              fontSize: 22,
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onClick={() => navigate('/home')}
          >
            <span style={{ fontSize: 28 }}>🏺</span>
            陶艺云平台
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              background: 'transparent',
              borderBottom: 'none',
              minWidth: 500
            }}
          />
        </div>
        <div>
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer', color: 'white' }}>
                <Avatar src={user.avatar} icon={<UserOutlined />} />
                <span>{user.name}</span>
              </Space>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate('/login')}>
              登录
            </Button>
          )}
        </div>
      </Header>
      <Content style={{ padding: 0 }}>
        <Outlet />
      </Content>
      <Footer style={{
        textAlign: 'center',
        background: '#2c1810',
        color: 'rgba(255,255,255,0.7)',
        padding: '24px 50px'
      }}>
        传统陶艺技艺数字化展示与创作平台 ©2024 版权所有
      </Footer>
    </Layout>
  )
}

export default MainLayout
