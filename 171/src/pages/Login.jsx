import { useEffect, useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Tabs, Divider, Alert } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { phoneRegex, passwordRegex } from '@/hooks/useFormValidation'

const { Title, Text } = Typography

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, currentUser, error, clearError } = useAuth()
  const [activeTab, setActiveTab] = useState('user')
  const [form] = Form.useForm()

  const from = location.state?.from || '/'

  useEffect(() => {
    if (currentUser) {
      if (from !== '/' && from !== '/login' && from !== '/register') {
        navigate(from, { replace: true })
      } else if (currentUser.role === 'user') {
        navigate('/user', { replace: true })
      } else if (currentUser.role === 'cleaner') {
        navigate('/cleaner', { replace: true })
      }
    }
  }, [currentUser, navigate, from])

  useEffect(() => {
    if (error) {
      message.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleSubmit = (values) => {
    login({
      ...values,
      role: activeTab,
    })
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          borderRadius: 12,
        }}
        bodyStyle={{ padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧹</div>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            欢迎登录
          </Title>
          <Text type="secondary">专业上门保洁服务平台</Text>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            { key: 'user', label: '用户登录' },
            { key: 'cleaner', label: '保洁师登录' },
          ]}
        />

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          size="large"
          initialValues={{ phone: activeTab === 'user' ? '13800138001' : '13900139001', password: '123456' }}
        >
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: phoneRegex, message: '请输入正确的手机号' },
            ]}
          >
            <Input prefix={<MobileOutlined />} placeholder="请输入手机号" maxLength={11} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { pattern: passwordRegex, message: '密码长度6-20位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{ height: 48, fontSize: 16 }}>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary">还没有账号？</Text>
        </Divider>

        <Link to="/register">
          <Button block style={{ height: 44 }}>
            立即注册
          </Button>
        </Link>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            测试账号：用户 13800138001 / 123456
            <br />
            保洁师 13900139001 / 123456
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login
