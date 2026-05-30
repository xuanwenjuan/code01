import React from 'react'
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  DashboardOutlined,
  PictureOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined
} from '@ant-design/icons'
import { logout } from '@/store/slices/userSlice'

const { Header, Sider, Content } = Layout

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { currentUser } = useSelector(state => state.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const userMenu = {
    items: [
      {
        key: 'home',
        icon: <HomeOutlined />,
        label: '返回首页',
        onClick: () => navigate('/')
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => navigate('/profile')
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

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '数据概览'
    },
    {
      key: '/admin/pigments',
      icon: <PictureOutlined />,
      label: '颜料管理'
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: '用户管理'
    }
  ]

  const selectedKey = location.pathname === '/admin' 
    ? '/admin' 
    : menuItems.find(item => location.pathname.startsWith(item.key))?.key || '/admin'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="dark"
        width={220}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #5D4037 0%, #3E2723 100%)'
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold',
          borderBottom: '1px solid #6D5047'
        }}>
          颜料管理后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
            marginTop: 20
          }}
        />
      </Sider>
      <Layout style={{ marginLeft: 220 }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={currentUser?.avatar} icon={<UserOutlined />} />
              <span style={{ fontWeight: 500 }}>{currentUser?.name}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: 8,
          minHeight: 'calc(100vh - 112px)'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
