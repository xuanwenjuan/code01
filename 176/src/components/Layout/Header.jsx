import React from 'react'
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/userSlice'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { isLoggedIn, currentUser } = useSelector((state) => state.user)

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        个人中心
      </Menu.Item>
      {currentUser?.role === 'designer' && (
        <Menu.Item key="works" icon={<SettingOutlined />} onClick={() => navigate('/profile/works')}>
          我的作品
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  )

  return (
    <AntHeader style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', color: '#1890ff', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <ShoppingOutlined style={{ marginRight: '8px' }} />
            校园文创平台
          </h1>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ border: 'none', minWidth: '200px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isLoggedIn ? (
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                <Avatar src={currentUser?.avatar} icon={<UserOutlined />} />
                <span>{currentUser?.name}</span>
                <span style={{ color: '#1890ff', fontSize: '12px' }}>
                  [{currentUser?.role === 'designer' ? '设计师' : '普通用户'}]
                </span>
              </div>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate('/login')}>
              登录
            </Button>
          )}
        </div>
      </div>
    </AntHeader>
  )
}

export default Header
