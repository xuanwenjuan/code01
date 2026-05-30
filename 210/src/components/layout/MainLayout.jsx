import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Button } from 'antd'
import {
  HomeOutlined,
  BookOutlined,
  FolderOpenOutlined,
  TrophyOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  TeamOutlined,
  DashboardOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/userSlice'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [collapsed, setCollapsed] = useState(false)
  const { currentUser } = useSelector((state) => state.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账号设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const employeeMenuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: '平台首页',
    },
    {
      key: '/courses',
      icon: <BookOutlined />,
      label: '课程学习',
    },
    {
      key: '/learning',
      icon: <FolderOpenOutlined />,
      label: '学习管理',
      children: [
        { key: '/learning/my-courses', label: '我的课程' },
        { key: '/learning/statistics', label: '学习统计' },
        { key: '/learning/certificates', label: '学习证书' },
      ],
    },
  ]

  const adminMenuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '数据概览',
    },
    {
      key: '/admin/courses',
      icon: <BookOutlined />,
      label: '课程管理',
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: '用户管理',
    },
  ]

  const menuItems = currentUser?.role === 'admin' ? adminMenuItems : employeeMenuItems

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          {!collapsed && (
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1677ff',
            }}>
              培训管理平台
            </div>
          )}
          {collapsed && (
            <BookOutlined style={{ fontSize: '24px', color: '#1677ff' }} />
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 999,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Text type="secondary">
              {currentUser?.role === 'admin' ? '管理员后台' : '员工学习平台'}
            </Text>
          </div>
          <Space size={16}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }} size={8}>
                <Avatar size="small" src={currentUser?.avatar} icon={<UserOutlined />} />
                <Text>{currentUser?.name}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{
          margin: '24px',
          minHeight: 'calc(100vh - 112px)',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
