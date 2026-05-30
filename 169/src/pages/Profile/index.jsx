import React from 'react'
import { Card, Avatar, Button, Statistic, Row, Col, Tag } from 'antd'
import {
  UserOutlined,
  ShoppingOutlined,
  HeartOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@/hooks/useAuth'

const Profile = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { orders } = useSelector((state) => state.order)
  const { favorites, addresses } = useSelector((state) => state.user)

  const stats = [
    {
      title: '待处理订单',
      value: orders.filter((o) => o.status === 'pending').length,
      icon: <ShoppingOutlined />
    },
    {
      title: '进行中订单',
      value: orders.filter((o) => o.status === 'processing').length,
      icon: <ShoppingOutlined />
    },
    {
      title: '已完成订单',
      value: orders.filter((o) => o.status === 'completed').length,
      icon: <ShoppingOutlined />
    },
    {
      title: '我的收藏',
      value: favorites.length,
      icon: <HeartOutlined />
    }
  ]

  const menuItems = [
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      title: '我的订单',
      description: '查看和管理您的预约订单',
      onClick: () => navigate('/orders')
    },
    {
      key: 'address',
      icon: <EnvironmentOutlined />,
      title: '常用地址',
      description: '管理您的服务地址',
      onClick: () => navigate('/address')
    },
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      title: '我的收藏',
      description: '查看您收藏的服务',
      onClick: () => navigate('/favorites')
    },
    {
      key: 'reviews',
      icon: <MessageOutlined />,
      title: '我的评价',
      description: '查看您的评价记录',
      onClick: () => navigate('/reviews')
    },
    {
      key: 'userinfo',
      icon: <SettingOutlined />,
      title: '账号设置',
      description: '修改个人信息和密码',
      onClick: () => navigate('/userinfo')
    }
  ]

  return (
    <div className="profile-page">
      <div className="section-container">
        <Card className="profile-header">
          <div className="profile-info">
            <Avatar size={80} src={currentUser?.avatar} icon={<UserOutlined />} />
            <div className="user-info">
              <h2 className="user-name">{currentUser?.name}</h2>
              <p className="user-phone">{currentUser?.phone}</p>
              <Tag color="blue">
                {currentUser?.role === 'technician' ? '维修师傅' : '普通用户'}
              </Tag>
            </div>
          </div>
        </Card>

        <Row gutter={[16, 16]} className="stats-row">
          {stats.map((stat, index) => (
            <Col xs={12} sm={6} key={index}>
              <Card className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <Statistic title={stat.title} value={stat.value} />
              </Card>
            </Col>
          ))}
        </Row>

        <div className="menu-section">
          <h3 className="section-title">功能菜单</h3>
          <Row gutter={[16, 16]}>
            {menuItems.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.key}>
                <Card
                  className="menu-card"
                  hoverable
                  onClick={item.onClick}
                >
                  <div className="menu-item">
                    <div className="menu-icon">{item.icon}</div>
                    <div className="menu-content">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  )
}

export default Profile
