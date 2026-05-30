import React, { useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Radio, Space } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { login } from '@/store/slices/userSlice'

const { Title, Text } = Typography

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, currentUser } = useSelector((state) => state.user)
  const [form] = Form.useForm()

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/home')
    }
  }, [currentUser, navigate])

  const onFinish = async (values) => {
    try {
      await dispatch(login(values.username, values.password)).unwrap()
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const fillDemoAccount = (role) => {
    if (role === 'admin') {
      form.setFieldsValue({ username: 'admin', password: 'admin123' })
    } else {
      form.setFieldsValue({ username: 'employee', password: 'employee123' })
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#1677ff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <LoginOutlined style={{ fontSize: '32px', color: '#fff' }} />
          </div>
          <Title level={3} style={{ marginBottom: '8px' }}>
            企业员工培训管理平台
          </Title>
          <Text type="secondary">请登录以继续</Text>
        </div>

        {error && (
          <Alert
            message="登录失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 4, max: 20, message: '用户名长度为 4-20 个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度为 6-20 个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ height: '44px', fontSize: '16px' }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>

        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #f0f0f0',
        }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
            演示账号（点击快速填充）：
          </Text>
          <Space wrap>
            <Button size="small" onClick={() => fillDemoAccount('admin')}>
              管理员：admin / admin123
            </Button>
            <Button size="small" onClick={() => fillDemoAccount('employee')}>
              员工：employee / employee123
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default Login
