import React from 'react'
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { EnvironmentOutlined, UserOutlined, LogoutOutlined, AppstoreOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import useCity from '@/hooks/useCity'
import useAuth from '@/hooks/useAuth'
import './index.css'

const { Header, Content, Footer } = Layout

const AppLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentCity, cities, changeCity } = useCity()
  const { userInfo, logout } = useAuth()

  const cityMenu = {
    items: cities.map(city => ({
      key: city,
      label: city
    })),
    onClick: ({ key }) => changeCity(key)
  }

  const userMenu = {
    items: [
      userInfo?.role === 'worker' ? {
        key: 'worker',
        icon: <SafetyCertificateOutlined />,
        label: '师傅中心',
        onClick: () => navigate('/worker/orders')
      } : {
        key: 'user',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => navigate('/user/orders')
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: () => {
          logout()
          navigate('/')
        }
      }
    ]
  }

  const navItems = [
    { key: '/', label: '首页', icon: <AppstoreOutlined /> }
  ]

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-content container">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">🧹</span>
            <span className="logo-text">洁家帮</span>
          </div>
          
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems}
            className="nav-menu"
            onClick={({ key }) => navigate(key)}
          />
          
          <div className="header-right">
            <Dropdown menu={cityMenu} placement="bottom">
              <Button type="text" className="city-btn">
                <EnvironmentOutlined />
                <span>{currentCity}</span>
              </Button>
            </Dropdown>
            
            {userInfo ? (
              <Dropdown menu={userMenu} placement="bottomRight">
                <div className="user-info">
                  <Avatar src={userInfo.avatar} size="small" />
                  <span className="username">{userInfo.nickname}</span>
                </div>
              </Dropdown>
            ) : (
              <Button type="primary" onClick={() => navigate('/login')}>
                登录
              </Button>
            )}
          </div>
        </div>
      </Header>
      
      <Content className="app-content">
        <Outlet />
      </Content>
      
      <Footer className="app-footer">
        <div className="container footer-content">
          <div className="footer-left">
            <span className="logo-text">洁家帮</span>
            <span className="copyright">© 2024 同城上门家电清洗平台</span>
          </div>
          <div className="footer-right">
            <span>服务热线：400-888-8888</span>
            <span>工作时间：08:00-21:00</span>
          </div>
        </div>
      </Footer>
    </Layout>
  )
}

export default AppLayout
