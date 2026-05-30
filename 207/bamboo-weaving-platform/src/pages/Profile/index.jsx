import React, { useState } from 'react'
import { 
  Card, Avatar, Typography, Descriptions, Button, 
  Form, Input, Modal, message, Row, Col, Statistic, Tag
} from 'antd'
import { 
  UserOutlined, EditOutlined, SaveOutlined, 
  BookOutlined, HeartOutlined, UploadOutlined 
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateUser } from '@/store/slices/userSlice'

const { Title } = Typography

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser } = useSelector(state => state.user)
  const { works } = useSelector(state => state.works)
  const [editVisible, setEditVisible] = useState(false)
  const [form] = Form.useForm()

  if (!currentUser) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <p>请先登录</p>
        <Button type="primary" onClick={() => navigate('/login')}>去登录</Button>
      </div>
    )
  }

  const myWorks = works.filter(w => w.authorId === currentUser.id)
  const myApprovedWorks = myWorks.filter(w => w.status === 'approved')
  const totalLikes = myApprovedWorks.reduce((sum, w) => sum + w.likes, 0)
  const totalViews = myApprovedWorks.reduce((sum, w) => sum + w.views, 0)

  const handleEdit = () => {
    form.setFieldsValue(currentUser)
    setEditVisible(true)
  }

  const handleSave = () => {
    form.validateFields().then(values => {
      dispatch(updateUser(values))
      message.success('个人信息更新成功')
      setEditVisible(false)
    })
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>个人中心</Title>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} md={6} style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              src={currentUser.avatar} 
              icon={<UserOutlined />} 
              style={{ marginBottom: 16 }}
            />
            <Title level={3} style={{ margin: 0 }}>{currentUser.nickname}</Title>
            <Tag color={currentUser.role === 'admin' ? 'red' : 'blue'} style={{ marginTop: 8 }}>
              {currentUser.role === 'admin' ? '管理员' : '普通用户'}
            </Tag>
          </Col>
          <Col xs={24} md={18}>
            <Descriptions column={2}>
              <Descriptions.Item label="用户名">{currentUser.username}</Descriptions.Item>
              <Descriptions.Item label="手机号">{currentUser.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{currentUser.email}</Descriptions.Item>
              <Descriptions.Item label="注册时间">{currentUser.createTime}</Descriptions.Item>
            </Descriptions>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={handleEdit}
              style={{ marginTop: 16 }}
            >
              编辑信息
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="作品数量" 
              value={myWorks.length} 
              prefix={<UploadOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="获赞总数" 
              value={totalLikes} 
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="浏览总数" 
              value={totalViews} 
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="我的作品">
        {myWorks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            暂无作品，快去上传你的第一个作品吧！
            <br />
            <Button 
              type="primary" 
              style={{ marginTop: 16 }}
              onClick={() => navigate('/creation')}
            >
              上传作品
            </Button>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {myWorks.map(work => (
              <Col xs={24} sm={12} lg={6} key={work.id}>
                <Card
                  hoverable
                  cover={<img alt={work.title} src={work.images[0]} style={{ height: 150, objectFit: 'cover' }} />}
                  actions={[
                    <Button type="link" onClick={() => navigate(`/works/${work.id}`)}>查看</Button>
                  ]}
                >
                  <Card.Meta
                    title={work.title}
                    description={
                      <div>
                        <Tag color={work.status === 'approved' ? 'green' : work.status === 'pending' ? 'orange' : 'red'}>
                          {work.status === 'approved' ? '已审核' : work.status === 'pending' ? '待审核' : '已拒绝'}
                        </Tag>
                        <div style={{ marginTop: 4 }}>
                          <HeartOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />{work.likes}
                          <span style={{ marginLeft: 12 }}>👁 {work.views}</span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <Modal
        title="编辑个人信息"
        open={editVisible}
        onOk={handleSave}
        onCancel={() => setEditVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[
              { required: true, message: '请输入昵称' },
              { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/, message: '昵称只能包含中文、字母、数字和下划线，2-20位' }
            ]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Profile
