import React from 'react'
import { Layout, Menu, Avatar, Descriptions, Button, Tag } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined, ShoppingOutlined, StarOutlined, LogoutOutlined } from '@ant-design/icons'
import useAuth from '@/hooks/useAuth'
import './index.css'

const { Sider, Content } = Layout

const UserCenter = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, logout } = useAuth()

  const menuItems = [
    {
      key: '/user/orders',
      icon: <ShoppingOutlined />,
      label: '我的订单',
      onClick: () => navigate('/user/orders')
    },
    {
      key: '/user/reviews',
      icon: <StarOutlined />,
      label: '我的评价',
      onClick: () => navigate('/user/reviews')
    }
  ]

  const selectedKey = location.pathname

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="user-center container">
      <div className="page-content">
        <Layout className="center-layout">
          <Sider width={240} className="center-sider">
            <div className="user-profile">
              <Avatar size={64} src={userInfo?.avatar}>
                <UserOutlined />
              </Avatar>
              <h3 className="user-name">{userInfo?.nickname}</h3>
              <Tag color="blue">普通用户</Tag>
              <p className="user-phone">{userInfo?.phone}</p>
            </div>
            
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              items={menuItems}
              className="center-menu"
            />
            
            <Button
              type="text"
              icon={<LogoutOutlined />}
              className="logout-btn"
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </Sider>
          
          <Content className="center-content">
            <Outlet />
          </Content>
        </Layout>
      </div>
    </div>
  )
}

export default UserCenter
