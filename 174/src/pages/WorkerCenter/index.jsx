import React from 'react'
import { Layout, Menu, Avatar, Tag, Button } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { SafetyCertificateOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons'
import useAuth from '@/hooks/useAuth'
import './index.css'

const { Sider, Content } = Layout

const WorkerCenter = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, logout } = useAuth()

  const menuItems = [
    {
      key: '/worker/orders',
      icon: <FileTextOutlined />,
      label: '服务订单',
      onClick: () => navigate('/worker/orders')
    }
  ]

  const selectedKey = location.pathname

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="worker-center container">
      <div className="page-content">
        <Layout className="center-layout">
          <Sider width={240} className="center-sider">
            <div className="worker-profile">
              <Avatar size={64} src={userInfo?.avatar} />
              <h3 className="worker-name">{userInfo?.nickname}</h3>
              <Tag color="orange">清洗师傅</Tag>
              <div className="worker-stats">
                <div className="stat-item">
                  <span className="stat-value">{userInfo?.rating || 4.9}</span>
                  <span className="stat-label">评分</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userInfo?.orders || 1256}</span>
                  <span className="stat-label">服务单</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userInfo?.experience || '8年'}</span>
                  <span className="stat-label">从业</span>
                </div>
              </div>
              <div className="worker-skills">
                {userInfo?.skills?.map((skill, index) => (
                  <Tag key={index} color="blue">{skill}</Tag>
                ))}
              </div>
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

export default WorkerCenter
