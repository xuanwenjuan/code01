import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Input, Badge, Dropdown, Avatar, Menu, message } from 'antd'
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  HeartOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { toggleSelector } from '@/store/communitySlice'
import { selectCartCount } from '@/store/cartSlice'
import { logout } from '@/store/userSlice'
import { useDebounce } from '@/hooks'
import './index.scss'

const { Header: AntHeader } = Layout
const { Search } = Input

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentCommunity, showSelector } = useSelector(state => state.community)
  const { isLoggedIn, userInfo, role } = useSelector(state => state.user)
  const cartCount = useSelector(selectCartCount)
  const [searchText, setSearchText] = useState('')
  const debouncedSearch = useDebounce(searchText, 500)

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(value)}`)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    message.success('已退出登录')
    navigate('/')
  }

  const handleSwitchRole = () => {
    message.info('正在切换到团长后台...')
  }

  const userMenu = (
    <Menu>
      {role === 'consumer' && (
        <Menu.Item key="leader" icon={<AppstoreOutlined />} onClick={handleSwitchRole}>
          切换到团长后台
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">个人中心</Link>
      </Menu.Item>
      <Menu.Item key="orders" icon={<HistoryOutlined />}>
        <Link to="/orders">我的订单</Link>
      </Menu.Item>
      <Menu.Item key="favorites" icon={<HeartOutlined />}>
        <Link to="/favorites">我的收藏</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/profile/settings">账号设置</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  )

  return (
    <AntHeader className="site-header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/')}>
          <span className="logo-icon">🥬</span>
          <span className="logo-text">鲜到家</span>
        </div>

        <div
          className="community-selector"
          onClick={() => dispatch(toggleSelector())}
        >
          <span className="community-label">配送至</span>
          <span className="community-name">{currentCommunity.name}</span>
          <DownOutlined className={`arrow ${showSelector ? 'up' : ''}`} />
        </div>

        <div className="search-box">
          <Search
            placeholder="搜索新鲜好货..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
          />
        </div>

        <div className="header-actions">
          <Link to="/cart" className="cart-link">
            <Badge count={cartCount} size="small" offset={[4, -4]}>
              <ShoppingCartOutlined className="icon" />
              <span>购物车</span>
            </Badge>
          </Link>

          {isLoggedIn ? (
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div className="user-info">
                <Avatar src={userInfo?.avatar} size="small" />
                <span className="username">{userInfo?.nickname}</span>
                <DownOutlined className="arrow" />
              </div>
            </Dropdown>
          ) : (
            <div className="auth-links">
              <Link to="/login">登录</Link>
              <span className="divider">|</span>
              <Link to="/register">注册</Link>
            </div>
          )}
        </div>
      </div>
    </AntHeader>
  )
}

export default React.memo(Header)
