import React, { useState } from 'react'
import { Layout, Menu, Dropdown, Avatar, Space, Button, Modal, Select } from 'antd'
import {
  EnvironmentOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  MenuOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '@/hooks/useAuth'
import { setCurrentCity } from '@/store/slices/appSlice'

const { Header } = Layout
const { Option } = Select

const AppHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { handleLogout, isAuthenticated, currentUser } = useAuth()
  const { currentCity, cities } = useSelector((state) => state.app)
  const [cityModalVisible, setCityModalVisible] = useState(false)

  const menuItems = [
    { key: '/', label: '首页' },
    { key: '/services', label: '服务列表' },
    { key: '/orders', label: '我的订单' },
    { key: '/favorites', label: '我的收藏' }
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile')
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: '我的订单',
      onClick: () => navigate('/orders')
    },
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: '我的收藏',
      onClick: () => navigate('/favorites')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账号设置',
      onClick: () => navigate('/userinfo')
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleCityChange = (value) => {
    dispatch(setCurrentCity(value))
    setCityModalVisible(false)
  }

  return (
    <Header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">🔧</span>
            <span className="logo-text">同城家电维修</span>
          </div>
          <div className="city-selector" onClick={() => setCityModalVisible(true)}>
            <EnvironmentOutlined />
            <span className="city-name">{currentCity}</span>
            <span className="city-arrow">▼</span>
          </div>
        </div>

        <div className="header-center">
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="header-menu"
          />
        </div>

        <div className="header-right">
          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-info">
                <Avatar size={32} src={currentUser?.avatar} icon={<UserOutlined />} />
                <span className="user-name">{currentUser?.name}</span>
              </div>
            </Dropdown>
          ) : (
            <Space>
              <Button type="link" onClick={() => navigate('/login')}>
                登录
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                注册
              </Button>
            </Space>
          )}
        </div>
      </div>

      <Modal
        title="选择城市"
        open={cityModalVisible}
        onCancel={() => setCityModalVisible(false)}
        footer={null}
        width={500}
      >
        <div className="city-list">
          <p className="city-label">当前城市：{currentCity}</p>
          <p className="city-label">热门城市：</p>
          <div className="city-grid">
            {cities.map((city) => (
              <Button
                key={city}
                type={currentCity === city ? 'primary' : 'default'}
                onClick={() => handleCityChange(city)}
                className="city-btn"
              >
                {city}
              </Button>
            ))}
          </div>
        </div>
      </Modal>
    </Header>
  )
}

export default AppHeader
