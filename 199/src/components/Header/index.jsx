import { Layout, Menu, Dropdown, Avatar, Button, message } from 'antd'
import { HomeOutlined, UserOutlined, LoginOutlined, LogoutOutlined, ShoppingOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/userSlice'
import './index.css'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.user.currentUser)

  const menuItems = [
    {
      key: '/',
      label: '首页',
      icon: <HomeOutlined />
    },
    {
      key: '/incense',
      label: '香品',
      icon: <ShoppingOutlined />
    }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    dispatch(logout())
    message.success('退出登录成功')
    navigate('/')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile')
    },
    ...(currentUser?.role === 'admin' ? [
      {
        key: 'admin',
        icon: <SettingOutlined />,
        label: '管理后台',
        onClick: () => navigate('/admin')
      }
    ] : []),
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
    <AntHeader className="app-header">
      <div className="header-logo" onClick={() => navigate('/')}>
        <span className="logo-icon">🌸</span>
        <span className="logo-text">香韵千年</span>
      </div>
      <Menu
        className="header-menu"
        mode="horizontal"
        selectedKeys={[location.pathname === '/incense' ? '/incense' : '/']}
        items={menuItems}
        onClick={handleMenuClick}
      />
      <div className="header-user">
        {currentUser ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="user-info">
              <Avatar src={currentUser.avatar} size="small" />
              <span className="user-name">{currentUser.nickname}</span>
            </div>
          </Dropdown>
        ) : (
          <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
            登录
          </Button>
        )}
      </div>
    </AntHeader>
  )
}

export default Header
