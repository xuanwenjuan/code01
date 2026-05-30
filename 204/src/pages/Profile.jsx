import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Card, Descriptions, Avatar, Button, Tag, Result } from 'antd'
import { EditOutlined } from '@ant-design/icons'

const Profile = () => {
  const navigate = useNavigate()
  const currentUser = useSelector(state => state.user.currentUser)

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <Result
          status="warning"
          title="请先登录"
          extra={
            <Button type="primary" onClick={() => navigate('/login')}>
              去登录
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>个人信息</h1>
          <p>查看和管理您的账户信息</p>
        </div>
      </div>

      <div className="container">
        <Card style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
            <Avatar size={100} src={currentUser.avatar} />
            <div>
              <h2 style={{ marginBottom: 8 }}>{currentUser.name}</h2>
              <div style={{ marginBottom: 8 }}>
                <Tag color={currentUser.role === 'admin' ? 'gold' : 'green'}>
                  {currentUser.role === 'admin' ? '平台管理员' : '普通用户'}
                </Tag>
              </div>
              <p style={{ color: '#666', margin: 0 }}>用户名：{currentUser.username}</p>
            </div>
          </div>
          
          <Descriptions bordered column={1}>
            <Descriptions.Item label="用户ID">{currentUser.id}</Descriptions.Item>
            <Descriptions.Item label="姓名">{currentUser.name}</Descriptions.Item>
            <Descriptions.Item label="用户名">{currentUser.username}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{currentUser.email}</Descriptions.Item>
            <Descriptions.Item label="用户角色">
              <Tag color={currentUser.role === 'admin' ? 'gold' : 'green'}>
                {currentUser.role === 'admin' ? '平台管理员' : '普通用户'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="注册时间">{currentUser.createTime}</Descriptions.Item>
            <Descriptions.Item label="账号状态">
              <Tag color="green">正常</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="收藏教程">
              {currentUser.favorites?.length || 0} 个
            </Descriptions.Item>
            <Descriptions.Item label="收藏作品">
              {currentUser.favoriteWorks?.length || 0} 个
            </Descriptions.Item>
            <Descriptions.Item label="浏览记录">
              {currentUser.browseHistory?.length || 0} 条
            </Descriptions.Item>
            <Descriptions.Item label="我的作品">
              {currentUser.myWorks?.length || 0} 个
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Button type="primary" icon={<EditOutlined />}>
              编辑资料
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Profile
