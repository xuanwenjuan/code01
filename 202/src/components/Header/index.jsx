import React, { useState } from 'react'
import { Layout, Menu, Dropdown, Avatar, Button, Space } from 'antd'
import {
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  LoginOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { clearUserData } from '../../store/slices/userSlice'

const { Header } = Layout

const AppHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [selectedKey, setSelectedKey] = useState(location.pathname)

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key)
    navigate(key)
  }

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearUserData())
    navigate('/login')
  }

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '档案首页' },
    { key: '/skills', icon: <FileTextOutlined />, label: '技艺档案' },
  ]

  const userMenu = {
    items: [
      { key: '/profile', icon: <UserOutlined />, label: '个人中心' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
    ],
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return '管理员'
      case 'inheritor':
        return '传承人'
      default:
        return '用户'
    }
  }

  return (
    <Header
      style={{
        background: 'linear-gradient(135deg, #8B6914 0%, #6b4e0f 100%)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          color: '#fff',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
        onClick={() => navigate('/')}
      >
        <span style={{ fontSize: '28px' }}>📜</span>
        <span>古法造纸技艺数字化档案平台</span>
      </div>

      <div style={{ flex: 1, maxWidth: '600px', margin: '0 40px' }}>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            borderBottom: 'none',
            justifyContent: 'center',
          }}
          theme="dark"
        >
          {menuItems.map((item) => (
            <Menu.Item key={item.key} style={{ color: '#fff' }}>
              {item.icon}
              <span style={{ marginLeft: '8px' }}>{item.label}</span>
            </Menu.Item>
          ))}
        </Menu>
      </div>

      <div>
        {user ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <Space style={{ color: '#fff', cursor: 'pointer' }}>
              <Avatar src={user.avatar} icon={<UserOutlined />} />
              <span>{user.name}</span>
              <span
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                {getRoleLabel(user.role)}
              </span>
              <DownOutlined />
            </Space>
          </Dropdown>
        ) : (
          <Button
            type="primary"
            ghost
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
          >
            登录
          </Button>
        )}
      </div>
    </Header>
  )
}

export default AppHeader
