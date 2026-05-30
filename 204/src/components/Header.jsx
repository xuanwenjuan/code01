import React from 'react'
import { Layout, Menu, Dropdown, Avatar, Button, Badge } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  SettingOutlined,
  HeartOutlined,
  HistoryOutlined,
  FolderOpenOutlined,
  BellOutlined
} from '@ant-design/icons'
import { logout } from '../store/slices/userSlice'

const { Header } = Layout

const AppHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.user.currentUser)
  const notifications = useSelector(state => state.data.notifications)
  const unreadCount = notifications?.filter(n => !n.read)?.length || 0

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const userMenu = {
    items: [
      {
        key: '/profile',
        icon: <UserOutlined />,
        label: '个人信息'
      },
      {
        key: '/notifications',
        icon: <BellOutlined />,
        label: (
          <span>
            消息通知
            {unreadCount > 0 && (
              <Badge 
                count={unreadCount} 
                size="small"
                style={{ marginLeft: 8 }}
              />
            )}
          </span>
        )
      },
      {
        key: '/favorites',
        icon: <HeartOutlined />,
        label: '我的收藏'
      },
      {
        key: '/history',
        icon: <HistoryOutlined />,
        label: '浏览记录'
      },
      {
        key: '/my-works',
        icon: <FolderOpenOutlined />,
        label: '我的作品'
      },
      {
        type: 'divider'
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        danger: true,
        onClick: handleLogout
      }
    ],
    onClick: ({ key }) => {
      if (key !== 'logout') {
        navigate(key)
      }
    }
  }

  const getSelectedKeys = () => {
    const path = location.pathname
    if (path.startsWith('/admin')) return ['/admin']
    if (path.startsWith('/tutorial')) return ['/tutorials']
    if (path.startsWith('/material')) return ['/materials']
    return [path]
  }

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/materials',
      icon: <BookOutlined />,
      label: '染材图鉴'
    },
    {
      key: '/tutorials',
      icon: <BookOutlined />,
      label: '技艺教程'
    },
    {
      key: '/works',
      icon: <HeartOutlined />,
      label: '作品展示'
    }
  ]

  if (currentUser?.role === 'admin') {
    menuItems.push({
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '管理后台'
    })
  }

  return (
    <Header style={{
      background: 'linear-gradient(135deg, #2d5a27 0%, #1a3a17 100%)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
        <div style={{ 
          color: 'white', 
          fontSize: 20, 
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }} onClick={() => navigate('/')}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4a7c43 0%, #2d5a27 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20
          }}>
            🌿
          </div>
          草木染交流平台
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            background: 'transparent',
            borderBottom: 'none',
            minWidth: 500
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {currentUser ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              cursor: 'pointer',
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s'
            }}>
              <Avatar src={currentUser.avatar} size={32} />
              <span style={{ color: 'white', fontSize: 14 }}>
                {currentUser.name}
                {currentUser.role === 'admin' && (
                  <span className="badge-admin" style={{ marginLeft: 8 }}>管理员</span>
                )}
              </span>
            </div>
          </Dropdown>
        ) : (
          <Button 
            type="primary" 
            icon={<UserOutlined />}
            onClick={() => navigate('/login')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white'
            }}
          >
            登录
          </Button>
        )}
      </div>
    </Header>
  )
}

export default AppHeader
