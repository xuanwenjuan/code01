import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd'
import {
  DashboardOutlined,
  BarcodeOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { logout, selectCurrentUser } from '@/store/slices/userSlice'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector(selectCurrentUser)

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '平台首页'
    },
    {
      key: '/tracking',
      icon: <BarcodeOutlined />,
      label: '货物跟踪'
    },
    {
      key: '/management',
      icon: <UnorderedListOutlined />,
      label: '跟踪管理'
    }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const userMenuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: (
        <div>
          <Text strong>{user?.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user?.role === 'admin' ? '平台管理员' : '物流跟单员'}
          </Text>
        </div>
      ),
      disabled: true
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: '#001529',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 24px',
          color: '#fff',
          fontSize: collapsed ? 24 : 18,
          fontWeight: 600,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {collapsed ? '🚚' : '🚚 物流跟踪平台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, marginTop: 16 }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          height: 64
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {collapsed ? (
              <MenuUnfoldOutlined
                style={{ fontSize: 18, cursor: 'pointer', color: '#666' }}
                onClick={() => setCollapsed(false)}
              />
            ) : (
              <MenuFoldOutlined
                style={{ fontSize: 18, cursor: 'pointer', color: '#666' }}
                onClick={() => setCollapsed(true)}
              />
            )}
            <Text type="secondary" style={{ fontSize: 14 }}>
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </Text>
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              padding: '4px 12px',
              borderRadius: 20,
              transition: 'background 0.3s'
            }}>
              <Avatar size={32} src={user?.avatar} icon={<UserOutlined />} />
              <span style={{ fontSize: 14 }}>{user?.name}</span>
            </div>
          </Dropdown>
        </Header>
        <Content>
          <div className="page-container">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
