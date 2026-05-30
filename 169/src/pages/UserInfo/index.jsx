import React from 'react'
import { Card, Form, Input, Button, Avatar, Upload, message, Row, Col, Descriptions, Space } from 'antd'
import { UserOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'
import { useDispatch } from 'react-redux'
import { updateUser } from '@/store/slices/userSlice'
import dayjs from 'dayjs'

const UserInfo = () => {
  const { currentUser, handleLogout } = useAuth()
  const dispatch = useDispatch()
  const [form] = Form.useForm()

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      dispatch(updateUser(values))
      message.success('个人信息更新成功')
    })
  }

  const uploadProps = {
    name: 'avatar',
    action: '/api/upload',
    headers: {
      authorization: 'authorization-text'
    },
    beforeUpload: () => {
      message.info('演示模式，无需真实上传')
      return false
    }
  }

  return (
    <div className="userinfo-page">
      <div className="section-container">
        <div className="page-header">
          <h1 className="page-title">账号设置</h1>
        </div>

        <Row gutter={24}>
          <Col span={8}>
            <Card title="头像设置" className="avatar-card">
              <div className="avatar-section">
                <Avatar size={120} src={currentUser?.avatar} icon={<UserOutlined />} />
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>更换头像</Button>
                </Upload>
              </div>
            </Card>
          </Col>
          <Col span={16}>
            <Card title="基本信息">
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  name: currentUser?.name,
                  phone: currentUser?.phone
                }}
                onFinish={handleSubmit}
              >
                <Form.Item
                  name="name"
                  label="姓名"
                  rules={[
                    { required: true, message: '请输入姓名' },
                    { pattern: /^[\u4e00-\u9fa5a-zA-Z]{2,}$/, message: '请输入正确的姓名' }
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label="手机号"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      保存修改
                    </Button>
                    <Button danger onClick={handleLogout}>
                      退出登录
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>

            <Card title="账号信息" style={{ marginTop: 16 }}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="用户ID">{currentUser?.id}</Descriptions.Item>
                <Descriptions.Item label="用户角色">
                  {currentUser?.role === 'technician' ? '维修师傅' : '普通用户'}
                </Descriptions.Item>
                <Descriptions.Item label="注册时间">
                  {currentUser?.createTime ? dayjs(currentUser.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default UserInfo
