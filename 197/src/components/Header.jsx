import React, { useState } from 'react'
import { Layout, Menu, Button, Input, Dropdown, Avatar, Space } from 'antd'
import {
  HomeOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/userSlice'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { currentUser } = useSelector(state => state.user)
  const [searchText, setSearchText] = useState('')

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchText.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchText)}`)
      setSearchText('')
    }
  }

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => navigate('/profile')
      },
      {
        key: 'admin',
        icon: <SettingOutlined />,
        label: '管理后台',
        onClick: () => navigate('/admin'),
        hidden: currentUser?.role !== 'admin'
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
    ].filter(item => !item.hidden)
  }

  const navItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/category', icon: <AppstoreOutlined />, label: '非遗分类' }
  ]

  return (
    <AntHeader style={{
      background: 'white',
      padding: '0 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 64
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#d4380d',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
          onClick={() => navigate('/')}
        >
          <span style={{ fontSize: 28 }}>🏛️</span>
          非遗文化遗产数字化平台
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={navItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderBottom: 'none', minWidth: 200 }}
        />
      </div>

      <Space size="middle">
        <form onSubmit={handleSearch} style={{ display: 'flex' }}>
          <Input
            placeholder="搜索非遗项目..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 280, borderRadius: 20 }}
            allowClear
          />
        </form>

        {currentUser ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={currentUser.avatar} size={32} />
              <span style={{ color: '#333' }}>{currentUser.name}</span>
            </Space>
          </Dropdown>
        ) : (
          <Button type="primary" onClick={() => navigate('/login')}>
            登录
          </Button>
        )}
      </Space>
    </AntHeader>
  )
}

export default Header
