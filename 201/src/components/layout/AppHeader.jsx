import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, Space } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  LoginOutlined
} from '@ant-design/icons'
import { logout } from '@/store/slices/userSlice'

const { Header } = Layout

function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { currentUser } = useSelector(state => state.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => navigate('/profile')
      },
      currentUser?.role === 'admin' && {
        key: 'admin',
        icon: <DashboardOutlined />,
        label: '管理后台',
        onClick: () => navigate('/admin')
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout
      }
    ].filter(Boolean)
  }

  const navItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
  ]

  return (
    <Header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'linear-gradient(90deg, #5D4037 0%, #8B4513 100%)',
      padding: '0 24px',
      height: 64,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
          onClick={() => navigate('/')}
        >
          <span style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a96e 0%, #8B4513 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18
          }}>
            矿
          </span>
          传统矿物颜料数字化展示平台
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={navItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderBottom: 'none',
            minWidth: 200
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {currentUser ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <Space style={{ cursor: 'pointer', color: '#fff' }}>
              <Avatar src={currentUser.avatar} icon={<UserOutlined />} />
              <span>{currentUser.name}</span>
            </Space>
          </Dropdown>
        ) : (
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
            style={{ background: '#c9a96e', borderColor: '#c9a96e' }}
          >
            登录
          </Button>
        )}
      </div>
    </Header>
  )
}

export default AppHeader
