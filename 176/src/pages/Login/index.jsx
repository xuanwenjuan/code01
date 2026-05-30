import React, { useEffect } from 'react'
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../store/userSlice'
import Loading from '../../components/Common/Loading'

const { Title, Paragraph, Text } = Typography

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { loading, isLoggedIn, error } = useSelector((state) => state.user)
  const [form] = Form.useForm()

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (isLoggedIn) {
      navigate(from, { replace: true })
    }
  }, [isLoggedIn, navigate, from])

  const handleSubmit = async (values) => {
    try {
      await dispatch(login(values.username, values.password))
      message.success('登录成功！')
      navigate(from, { replace: true })
    } catch (error) {
      message.error(error || '登录失败，请重试')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading text="登录中..." />
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            校园文创平台
          </Title>
          <Paragraph style={{ color: '#999', marginTop: '8px', marginBottom: 0 }}>
            登录您的账号，开始定制专属文创
          </Paragraph>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            closable
            style={{ marginBottom: '16px' }}
          />
        )}

        {from !== '/' && (
          <Alert
            type="info"
            message="您需要登录后才能访问此页面"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' },
              {
                pattern: /^[a-zA-Z0-9_]{3,20}$/,
                message: '用户名只能包含字母、数字和下划线',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
              { max: 20, message: '密码最多20个字符' },
              {
                pattern: /^[a-zA-Z0-9!@#$%^&*]{6,20}$/,
                message: '密码只能包含字母、数字和特殊字符(!@#$%^&*)',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Card size="small" style={{ background: '#f9f9f9', marginTop: '16px' }}>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            <strong>测试账号：</strong>
            <br />
            普通用户：student / 123456
            <br />
            文创设计师：designer / 123456
          </Text>
        </Card>
      </Card>
    </div>
  )
}

export default Login
