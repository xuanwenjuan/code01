import React, { useState } from 'react'
import { Layout as AntLayout, Menu, Dropdown, Avatar, Badge, Button, Space } from 'antd'
import {
  DashboardOutlined,
  CarOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice.js'

const { Header, Sider, Content } = AntLayout

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { userInfo } = useSelector(state => state.auth)

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '平台首页',
    },
    {
      key: '/dispatch',
      icon: <CarOutlined />,
      label: '订单调度',
    },
    {
      key: '/orders',
      icon: <UnorderedListOutlined />,
      label: '订单管理',
    },
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined /> 个人中心
        </span>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: '2',
      label: (
        <span onClick={handleLogout}>
          <LogoutOutlined /> 退出登录
        </span>
      ),
    },
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="dark"
        width={240}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold',
          background: 'rgba(255,255,255,0.1)'
        }}>
          {collapsed ? '物流' : '🚚 物流管理平台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        <Header 
          style={{ 
            padding: '0 24px', 
            background: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)'
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Space size={24}>
            <Badge count={3} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined style={{ fontSize: 18 }} />} 
                size="large"
              />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar src={userInfo?.avatar} icon={<UserOutlined />} />
                <span style={{ color: '#333' }}>
                  {userInfo?.name}
                  <span style={{ 
                    marginLeft: 8, 
                    fontSize: 12, 
                    color: '#1890ff',
                    background: '#e6f7ff',
                    padding: '2px 8px',
                    borderRadius: 4
                  }}>
                    {userInfo?.role === 'admin' ? '管理员' : '调度员'}
                  </span>
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="page-content">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
