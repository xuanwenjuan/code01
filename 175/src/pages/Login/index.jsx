import { useState } from 'react'
import { Form, Input, Button, Card, Tabs, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { validationRules } from '@/hooks/useFormValidation'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()
  const [form] = Form.useForm()
  const [role, setRole] = useState('user')

  const from = location.state?.from || '/home'

  const handleSubmit = async (values) => {
    try {
      await login(values.username, values.password, role)
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>🔧 同城管道疏通</h1>
          <p style={{ color: '#666' }}>欢迎回来，请登录您的账户</p>
        </div>

        <Tabs
          activeKey={role}
          onChange={setRole}
          centered
          items={[
            { key: 'user', label: '用户登录' },
            { key: 'master', label: '师傅登录' }
          ]}
        />

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          initialValues={{ remember: true }}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              {
                validator: (_, value) => {
                  if (value && validationRules.username.pattern.test(value)) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error(validationRules.username.message))
                }
              }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              {
                validator: (_, value) => {
                  if (value && validationRules.password.pattern.test(value)) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error(validationRules.password.message))
                }
              }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: '#666' }}>
            还没有账号？
            <a onClick={() => navigate('/register')}>立即注册</a>
          </div>
        </Form>

        <div style={{ marginTop: 24, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>测试账号：</p>
          <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
            普通用户：user / 123456
          </p>
          <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
            疏通师傅：master / 123456
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Login
