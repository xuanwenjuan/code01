import React from 'react'
import { Layout, Menu } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  HistoryOutlined,
  ToolOutlined
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import './MasterCenter.less'

const { Sider, Content } = Layout

const MasterCenter = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo } = useSelector(state => state.user)

  const menuItems = [
    {
      key: '/master/orders',
      icon: <HistoryOutlined />,
      label: '订单管理',
      onClick: () => navigate('/master/orders')
    }
  ]

  return (
    <Layout className="master-center">
      <Sider width={220} className="master-sider">
        <div className="master-profile">
          <div className="avatar-wrapper">
            <img src={userInfo?.avatar} alt="avatar" className="avatar" />
          </div>
          <h3 className="master-name">{userInfo?.nickname}</h3>
          <p className="master-role">
            <ToolOutlined /> 认证开锁师傅
          </p>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="master-menu"
        />
      </Sider>
      <Content className="master-content">
        <Outlet />
      </Content>
    </Layout>
  )
}

export default MasterCenter
