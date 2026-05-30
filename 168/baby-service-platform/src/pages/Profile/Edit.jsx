import React from 'react'
import { useSelector } from 'react-redux'
import { Card, Form, Input, Button, Avatar, Upload, message, Row, Col } from 'antd'
import { UserOutlined, PhoneOutlined, EnvironmentOutlined, UploadOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'
import { formRules } from '@/utils/regex'

const Edit = () => {
  const { currentUser, handleUpdateUser, isMom, isNanny } = useAuth()
  const [form] = Form.useForm()

  const handleSubmit = (values) => {
    handleUpdateUser(values)
  }

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件')
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB')
    }
    return isImage && isLt2M
  }

  const handleUploadChange = (info) => {
    if (info.file.status === 'done') {
      message.success('头像上传成功')
    } else if (info.file.status === 'error') {
      message.error('头像上传失败')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>个人信息</h1>
          <p>编辑您的个人信息</p>
        </div>
      </div>

      <div className="container page-content">
        <Row justify="center">
          <Col xs={24} md={16}>
            <Card className="card-shadow">
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Avatar size={100} src={currentUser?.avatar} style={{ marginBottom: 16 }} />
                <div>
                  <Upload
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    onChange={handleUploadChange}
                    action="/api/upload"
                  >
                    <Button size="small" icon={<UploadOutlined />}>更换头像</Button>
                  </Upload>
                </div>
              </div>

              <Form
                form={form}
                layout="vertical"
                size="large"
                initialValues={currentUser}
                onFinish={handleSubmit}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="昵称"
                      name="nickname"
                      rules={[{ required: true, message: '请输入昵称' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="请输入昵称" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="手机号"
                      name="phone"
                      rules={formRules.phone}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
                    </Form.Item>
                  </Col>
                </Row>

                {isMom && (
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="真实姓名"
                        name="realName"
                        rules={formRules.name}
                      >
                        <Input placeholder="请输入真实姓名" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="年龄"
                        name="age"
                      >
                        <Input type="number" placeholder="请输入年龄" />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                {isNanny && (
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="真实姓名"
                        name="realName"
                        rules={formRules.name}
                      >
                        <Input placeholder="请输入真实姓名" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="年龄"
                        name="age"
                      >
                        <Input type="number" placeholder="请输入年龄" />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                <Form.Item
                  label="所在地区"
                  name="address"
                >
                  <Input prefix={<EnvironmentOutlined />} placeholder="请输入所在地区" />
                </Form.Item>

                {isNanny && (
                  <Form.Item
                    label="个人简介"
                    name="introduction"
                  >
                    <Input.TextArea rows={4} placeholder="请简单介绍一下自己" maxLength={500} />
                  </Form.Item>
                )}

                <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" block size="large">
                    保存修改
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Edit
