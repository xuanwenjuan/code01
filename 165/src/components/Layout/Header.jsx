import { Layout, Dropdown, Avatar, Button, Modal } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  HomeOutlined,
  AppstoreOutlined,
  UserOutlined,
  EnvironmentOutlined,
  LogoutOutlined,
  HeartOutlined,
  SettingOutlined,
  DownOutlined
} from '@ant-design/icons'
import { useState } from 'react'
import { setCurrentCity } from '@/store/slices/appSlice'
import { logout } from '@/store/slices/userSlice'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { userInfo, role, token } = useSelector(state => state.user)
  const { currentCity, cityList } = useSelector(state => state.app)
  const [cityModalVisible, setCityModalVisible] = useState(false)

  const navItems = [
    { path: '/', label: '首页', icon: <HomeOutlined /> },
    { path: '/services', label: '全部服务', icon: <AppstoreOutlined /> }
  ]

  const handleCityClick = () => {
    setCityModalVisible(true)
  }

  const handleCitySelect = (city) => {
    dispatch(setCurrentCity(city))
    setCityModalVisible(false)
  }

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
        onClick: () => navigate('/profile/orders')
      },
      {
        key: 'favorites',
        icon: <HeartOutlined />,
        label: '我的收藏',
        onClick: () => navigate('/profile/favorites')
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '账户设置',
        onClick: () => navigate('/profile/settings')
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

  const workerMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '师傅中心',
        onClick: () => navigate('/profile/orders')
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '账户设置',
        onClick: () => navigate('/profile/settings')
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
    <>
      <AntHeader
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#1677ff',
            cursor: 'pointer',
            marginRight: 40
          }}
          onClick={() => navigate('/')}
        >
          同城生活
        </div>

        <Button
          type="text"
          icon={<EnvironmentOutlined />}
          onClick={handleCityClick}
          style={{ marginRight: 40 }}
        >
          {currentCity}
          <DownOutlined style={{ fontSize: 12, marginLeft: 4 }} />
        </Button>

        <nav style={{ display: 'flex', gap: 8, flex: 1 }}>
          {navItems.map(item => (
            <Button
              key={item.path}
              type={location.pathname === item.path ? 'primary' : 'text'}
              icon={item.icon}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {token ? (
            <Dropdown menu={role === 'worker' ? workerMenu : userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                <Avatar src={userInfo?.avatar} icon={<UserOutlined />} />
                <span>{userInfo?.nickname || '用户'}</span>
              </div>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate('/login')}>
              登录
            </Button>
          )}
        </div>
      </AntHeader>

      <Modal
        title="选择城市"
        open={cityModalVisible}
        onCancel={() => setCityModalVisible(false)}
        footer={null}
        width={500}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {cityList.map(city => (
            <Button
              key={city}
              type={city === currentCity ? 'primary' : 'default'}
              onClick={() => handleCitySelect(city)}
              style={{ minWidth: 80 }}
            >
              {city}
            </Button>
          ))}
        </div>
      </Modal>
    </>
  )
}

export default Header
