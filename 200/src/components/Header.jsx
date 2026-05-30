import { Layout, Menu, Button, Dropdown, Avatar, Badge } from 'antd'
import {
  HomeOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HeartOutlined,
  StarOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const { favorites } = useSelector(state => state.user)

  const navItems = [
    { key: '/', icon: <HomeOutlined />, label: '设计首页' },
    { key: '/category/classic', icon: <StarOutlined />, label: '经典榫卯' },
    { key: '/category/innovative', icon: <AppstoreOutlined />, label: '创新榫卯' }
  ]

  const handleMenuClick = ({ key }) => {
    if (key.startsWith('/category/')) {
      navigate('/')
    } else {
      navigate(key)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile')
    },
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: `我的收藏 (${favorites.length})`,
      onClick: () => navigate('/profile?tab=favorites')
    },
    { type: 'divider' },
    ...(user?.role === 'admin' ? [
      {
        key: 'admin',
        icon: <SettingOutlined />,
        label: '管理后台',
        onClick: () => navigate('/admin')
      },
      { type: 'divider' }
    ] : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  const getSelectedKey = () => {
    if (location.pathname === '/') return '/'
    if (location.pathname.startsWith('/mortise/')) return '/'
    return location.pathname
  }

  return (
    <AntHeader
      style={{
        position: 'fixed',
        top: 0,
        zIndex: 100,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '0 24px'
      }}
    >
      <div
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#8B4513',
          marginRight: '48px',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}
      >
        榫卯 · 数字化设计平台
      </div>

      <Menu
        mode="horizontal"
        selectedKeys={[getSelectedKey()]}
        items={navItems}
        onClick={handleMenuClick}
        style={{ flex: 1, borderBottom: 'none', minWidth: 400 }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size={36} src={user?.avatar} icon={<UserOutlined />} />
              <span style={{ color: '#333' }}>{user?.name}</span>
              {user?.role === 'admin' && (
                <Badge status="processing" color="#faad14" text="管理员" />
              )}
              {user?.role === 'craftsman' && (
                <Badge status="processing" color="#1890ff" text="工艺师" />
              )}
            </div>
          </Dropdown>
        ) : (
          <>
            <Button type="text" onClick={() => navigate('/login')}>登录</Button>
            <Button type="primary" onClick={() => navigate('/login')}>注册</Button>
          </>
        )}
      </div>
    </AntHeader>
  )
}

export default Header
