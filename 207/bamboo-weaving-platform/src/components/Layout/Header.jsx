import React from 'react'
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd'
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { logout } from '@/store/slices/userSlice'

const { Header: AntHeader } = Layout

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useSelector(state => state.user)

  const menuItems = [
    { key: '/', label: '首页' },
    { key: '/tutorials', label: '技艺教程' },
    { key: '/works', label: '作品展示' },
    { key: '/creation', label: '作品创作' },
  ]

  if (currentUser?.role === 'admin') {
    menuItems.push({ key: '/admin', label: '管理后台' })
  }

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => navigate('/profile')
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '账号设置',
        onClick: () => navigate('/settings')
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

  return (
    <AntHeader style={{ 
      display: 'flex', 
      alignItems: 'center', 
      background: 'linear-gradient(135deg, #389e0d 0%, #52c41a 100%)',
      padding: '0 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div style={{ 
        color: 'white', 
        fontSize: '20px', 
        fontWeight: 'bold', 
        marginRight: '48px',
        cursor: 'pointer'
      }} onClick={() => navigate('/')}>
        🎋 竹编技艺平台
      </div>
      
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ 
          flex: 1, 
          minWidth: 0,
          background: 'transparent',
          borderBottom: 'none'
        }}
      />
      
      {currentUser ? (
        <Dropdown menu={userMenu} placement="bottomRight">
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white' }}>
            <Avatar src={currentUser.avatar} icon={<UserOutlined />} style={{ marginRight: '8px' }} />
            <span>{currentUser.nickname}</span>
          </div>
        </Dropdown>
      ) : (
        <Button type="primary" ghost onClick={() => navigate('/login')}>
          登录
        </Button>
      )}
    </AntHeader>
  )
}

export default Header
