import React, { useState } from 'react'
import { Layout, Menu, Dropdown, Avatar, Button, Modal, Select, message } from 'antd'
import { UserOutlined, EnvironmentOutlined, HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { mockCities } from '@/mock/data'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, isLoggedIn, isMom, isNanny, handleLogout } = useAuth()
  const [cityModalVisible, setCityModalVisible] = useState(false)
  const [currentCity, setCurrentCity] = useState(mockCities[0])
  const [loginModalVisible, setLoginModalVisible] = useState(false)

  const navItems = [
    { key: '/', label: '首页' },
    { key: '/services', label: '服务列表' },
    { key: '/nannies', label: '找阿姨' },
    { key: '/about', label: '关于我们' }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleCityChange = (city) => {
    setCurrentCity(city)
    setCityModalVisible(false)
    message.success(`已切换到${city.name}`)
  }

  const handleLogoutClick = () => {
    handleLogout()
    navigate('/')
  }

  const userMenu = {
    items: [
      { key: 'profile', label: '个人中心', onClick: () => navigate('/profile') },
      { key: 'orders', label: '我的订单', onClick: () => navigate('/profile/orders') },
      { key: 'favorites', label: '我的收藏', onClick: () => navigate('/profile/favorites') },
      { type: 'divider' },
      { key: 'logout', label: '退出登录', onClick: handleLogoutClick }
    ]
  }

  return (
    <AntHeader style={{ background: '#fff', padding: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#ff6b9d', cursor: 'pointer', marginRight: 40 }} onClick={() => navigate('/')}>
          💕 母婴服务平台
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          style={{ flex: 1, borderBottom: 'none', minWidth: 400 }}
          items={navItems}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button type="text" icon={<EnvironmentOutlined />} onClick={() => setCityModalVisible(true)}>
            {currentCity.name}
          </Button>

          {isLoggedIn ? (
            <>
              <Button type="text" icon={<HeartOutlined />} onClick={() => navigate('/profile/favorites')}>
                收藏
              </Button>
              <Dropdown menu={userMenu} placement="bottomRight">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <Avatar src={currentUser.avatar} size={32} />
                  <span>{currentUser.nickname}</span>
                  {isMom && <span style={{ fontSize: 12, color: '#ff6b9d' }}>宝妈</span>}
                  {isNanny && <span style={{ fontSize: 12, color: '#1890ff' }}>母婴师</span>}
                </div>
              </Dropdown>
            </>
          ) : (
            <Button type="primary" onClick={() => navigate('/login')}>
              登录/注册
            </Button>
          )}
        </div>
      </div>

      <Modal
        title="选择城市"
        open={cityModalVisible}
        onCancel={() => setCityModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {mockCities.map(city => (
            <Button
              key={city.id}
              type={currentCity.id === city.id ? 'primary' : 'default'}
              onClick={() => handleCityChange(city)}
              style={{ minWidth: 80 }}
            >
              {city.name}
            </Button>
          ))}
        </div>
      </Modal>
    </AntHeader>
  )
}

export default React.memo(Header)
