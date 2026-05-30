import React, { useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Space, Badge } from 'antd'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  HomeOutlined,
  AppstoreOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  LogoutOutlined,
  SettingOutlined,
  DownOutlined,
  EnvironmentOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { logout } from '@/store/slices/userSlice'
import CitySelector from '@/components/common/CitySelector'
import NewUserModal from '@/components/common/NewUserModal'

const { Header, Content } = Layout

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { isLoggedIn, currentUser, userType } = useSelector((state) => state.user)
  const { currentCity } = useSelector((state) => state.app)
  const [selectedKey, setSelectedKey] = useState(location.pathname.split('/')[1] || 'home')

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key)
    navigate(`/${key === 'home' ? '' : key}`)
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
        onClick: () => navigate('/profile'),
      },
      {
        key: 'orders',
        icon: <ShoppingCartOutlined />,
        label: '我的订单',
        onClick: () => navigate('/orders'),
      },
      {
        key: 'pets',
        icon: <HeartOutlined />,
        label: '我的宠物',
        onClick: () => navigate('/pets'),
      },
      {
        key: 'favorites',
        icon: <HeartOutlined />,
        label: '我的收藏',
        onClick: () => navigate('/favorites'),
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  }

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: 'services',
      icon: <AppstoreOutlined />,
      label: '服务列表',
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#ff6b35',
              marginRight: '40px',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            🐾 宠物服务平台
          </div>

          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            style={{ flex: 1, border: 'none' }}
            items={menuItems}
          />

          <Space size="large">
            <CitySelector />

            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: '18px' }} />} />
            </Badge>

            {isLoggedIn ? (
              <Dropdown menu={userMenu} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar src={currentUser?.avatar} icon={<UserOutlined />} />
                  <span>{currentUser?.nickname || currentUser?.username}</span>
                  <DownOutlined style={{ fontSize: '12px' }} />
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
          </Space>
        </div>
      </Header>

      <Content>
        <Outlet />
      </Content>

      <footer
        style={{
          background: '#2c3e50',
          color: '#fff',
          padding: '40px 0',
          marginTop: '60px',
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ color: '#ff6b35', marginBottom: '16px' }}>🐾 宠物服务平台</h3>
              <p style={{ color: '#bdc3c7', fontSize: '14px', lineHeight: '1.8' }}>
                专业的同城宠物服务预约平台，为您的爱宠提供优质的洗护、寄养、美容、医疗等一站式服务。
              </p>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <h4 style={{ color: '#fff', marginBottom: '16px' }}>服务项目</h4>
              <p style={{ color: '#bdc3c7', fontSize: '14px', margin: '8px 0' }}>宠物洗护</p>
              <p style={{ color: '#bdc3c7', fontSize: '14px', margin: '8px 0' }}>宠物寄养</p>
              <p style={{ color: '#bdc3c7', fontSize: '14px', margin: '8px 0' }}>宠物美容</p>
              <p style={{ color: '#bdc3c7', fontSize: '14px', margin: '8px 0' }}>宠物医疗</p>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <h4 style={{ color: '#fff', marginBottom: '16px' }}>关于我们</h4>
              <p style={{ color: '#bdc3c7', fontSize: '14px', margin: '8px 0' }}>公司介绍</p>
              <p style={{ color: '#bdc3c7', fontSize: '14px', margin: '8px 0' }}>加入我们</p>
              <p style={{ color: '#bdc3c7', fontSize: '14px', margin: '8px 0' }}>联系方式</p>
              <p style={{ color: '#bdc3c7', fontSize: '14px', margin: '8px 0' }}>帮助中心</p>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <h4 style={{ color: '#fff', marginBottom: '16px' }}>联系我们</h4>
              <p style={{ color: '#bdc3c7', fontSize: '14px', margin: '8px 0' }}>客服热线：400-888-8888</p>
              <p style={{ color: '#bdc3c7', fontSize: '14px', margin: '8px 0' }}>服务时间：9:00-21:00</p>
              <p style={{ color: '#bdc3c7', fontSize: '14px', margin: '8px 0' }}>邮箱：service@pet.com</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #34495e', marginTop: '30px', paddingTop: '20px', textAlign: 'center', color: '#7f8c8d', fontSize: '13px' }}>
            © 2024 宠物服务平台 版权所有
          </div>
        </div>
      </footer>

      <NewUserModal />
    </Layout>
  )
}

export default MainLayout
