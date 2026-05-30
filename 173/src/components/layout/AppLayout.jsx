import React from 'react'
import { Layout, Menu, Dropdown, Avatar, Space, Button } from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  ToolOutlined,
  HistoryOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/actions/userActions'
import './AppLayout.less'

const { Header, Content, Footer } = Layout

const AppLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { userInfo, isLoggedIn, role } = useSelector(state => state.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const userMenu = {
    items: [
      {
        key: 'center',
        icon: role === 'user' ? <UserOutlined /> : <ToolOutlined />,
        label: role === 'user' ? '个人中心' : '师傅中心',
        onClick: () => navigate(role === 'user' ? '/user/orders' : '/master/orders')
      },
      {
        key: 'orders',
        icon: <HistoryOutlined />,
        label: '我的订单',
        onClick: () => navigate(role === 'user' ? '/user/orders' : '/master/orders')
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout
      }
    ]
  }

  const mainMenuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/')
    }
  ]

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            🔐 同城开锁
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={mainMenuItems}
            className="main-menu"
          />
          <div className="header-right">
            {isLoggedIn ? (
              <Dropdown menu={userMenu} placement="bottomRight">
                <Space className="user-info">
                  <Avatar src={userInfo?.avatar} icon={<UserOutlined />} />
                  <span>{userInfo?.nickname}</span>
                </Space>
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
        <p>同城上门开锁 © 2024 | 专业开锁 · 修锁 · 换锁服务平台</p>
        <p>24小时服务热线：400-888-8888</p>
      </Footer>
    </Layout>
  )
}

export default AppLayout
