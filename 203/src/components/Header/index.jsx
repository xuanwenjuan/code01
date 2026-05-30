import { Menu, Layout, Avatar, Dropdown, Button, Badge, Space } from 'antd'
import {
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
  HeartOutlined,
  HistoryOutlined,
  DashboardOutlined,
  LoginOutlined
} from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/store/slices/userSlice'
import NotificationPanel from '@/components/NotificationPanel'
import './index.css'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { isAuthenticated, currentUser, role, favorites, history } = useSelector(state => state.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const userMenu = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile')
    },
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: `我的收藏 (${favorites.types.length + favorites.works.length})`,
      onClick: () => navigate('/profile/favorites')
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: `浏览记录 (${history.length})`,
      onClick: () => navigate('/profile/history')
    },
    role === 'admin' && {
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

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/types', icon: <BookOutlined />, label: <Link to="/types">活字品类</Link> },
    { key: '/technique', icon: <BookOutlined />, label: <Link to="/technique">技艺详情</Link> },
    { key: '/works', icon: <BookOutlined />, label: <Link to="/works">印刷作品</Link> },
    { key: '/artisans', icon: <UserOutlined />, label: <Link to="/artisans">传承人</Link> }
  ]

  return (
    <AntHeader className="site-header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/')}>
          <span className="logo-text">木活字印刷</span>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="header-menu"
        />
        <div className="header-right">
          {isAuthenticated ? (
            <Space>
              <NotificationPanel />
              <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                <div className="user-info">
                  <Avatar src={currentUser?.avatar} icon={<UserOutlined />} />
                  <span className="user-name">{currentUser?.name}</span>
                  {role === 'admin' && <Badge status="processing" text="管理员" />}
                </div>
              </Dropdown>
            </Space>
          ) : (
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              登录
            </Button>
          )}
        </div>
      </div>
    </AntHeader>
  )
}

export default Header
