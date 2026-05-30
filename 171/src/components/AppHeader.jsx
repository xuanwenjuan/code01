import { useState, useMemo } from 'react'
import { Layout, Menu, Dropdown, Avatar, Button, Space, Select } from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setCity } from '@/store/slices/serviceSlice'
import { logout } from '@/store/slices/userSlice'

const { Header } = Layout
const { Option } = Select

function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.user)
  const { currentCity, cities } = useSelector((state) => state.service)

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith('/user') || location.pathname.startsWith('/cleaner')) {
      return 'center'
    }
    return location.pathname === '/' ? 'home' : ''
  }, [location.pathname])

  const handleCityChange = (value) => {
    dispatch(setCity(value))
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const userMenu = {
    items: [
      {
        key: 'center',
        icon: <UserOutlined />,
        label: currentUser?.role === 'cleaner' ? '保洁师中心' : '个人中心',
        onClick: () => navigate(currentUser?.role === 'cleaner' ? '/cleaner' : '/user'),
      },
      {
        key: 'orders',
        icon: <ShoppingOutlined />,
        label: '我的订单',
        onClick: () => navigate(currentUser?.role === 'cleaner' ? '/cleaner/orders' : '/user/orders'),
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  }

  return (
    <Header
      style={{
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 24 }}>🧹</span>
            洁家上门保洁
          </div>
        </Link>

        <Space>
          <EnvironmentOutlined style={{ color: '#999' }} />
          <Select
            value={currentCity}
            onChange={handleCityChange}
            style={{ width: 120 }}
            bordered={false}
          >
            {cities.map((city) => (
              <Option key={city} value={city}>
                {city}
              </Option>
            ))}
          </Select>
        </Space>

        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          style={{ flex: 1, minWidth: 400, borderBottom: 'none' }}
          items={[
            { key: 'home', label: <Link to="/">首页</Link>, icon: <HomeOutlined /> },
          ]}
        />
      </div>

      <div>
        {currentUser ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 4 }}>
              <Avatar src={currentUser.avatar} size="small" />
              <span>{currentUser.name}</span>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button type="text" onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              注册
            </Button>
          </Space>
        )}
      </div>
    </Header>
  )
}

export default AppHeader
