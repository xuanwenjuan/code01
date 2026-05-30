import React from 'react'
import { Layout, Menu } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  HistoryOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import './UserCenter.less'

const { Sider, Content } = Layout

const UserCenter = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo } = useSelector(state => state.user)

  const menuItems = [
    {
      key: '/user/orders',
      icon: <HistoryOutlined />,
      label: '我的预约',
      onClick: () => navigate('/user/orders')
    },
    {
      key: '/user/contacts',
      icon: <PhoneOutlined />,
      label: '联系记录',
      onClick: () => navigate('/user/contacts')
    }
  ]

  const selectedKey = location.pathname.includes('/user/orders')
    ? '/user/orders'
    : '/user/contacts'

  return (
    <Layout className="user-center">
      <Sider width={220} className="user-sider">
        <div className="user-profile">
          <div className="avatar-wrapper">
            <img src={userInfo?.avatar} alt="avatar" className="avatar" />
          </div>
          <h3 className="username">{userInfo?.nickname}</h3>
          <p className="user-role">普通用户</p>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="user-menu"
        />
      </Sider>
      <Content className="user-content">
        <Outlet />
      </Content>
    </Layout>
  )
}

export default UserCenter
