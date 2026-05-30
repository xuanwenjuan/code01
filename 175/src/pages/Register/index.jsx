import { useState } from 'react'
import { Form, Input, Button, Card, Tabs, message } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined, SolutionOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { validationRules } from '@/hooks/useFormValidation'

function Register() {
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const [form] = Form.useForm()
  const [role, setRole] = useState('user')

  const handleSubmit = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    try {
      await register({
        username: values.username,
        password: values.password,
        phone: values.phone,
        name: values.name,
        role
      })
      navigate('/home')
    } catch (error) {
      console.error('Register failed:', error)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>🔧 同城管道疏通</h1>
          <p style={{ color: '#666' }}>创建您的账户</p>
        </div>

        <Tabs
          activeKey={role}
          onChange={setRole}
          centered
          items={[
            { key: 'user', label: '用户注册' },
            { key: 'master', label: '师傅注册' }
          ]}
        />

        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
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
            <Input prefix={<UserOutlined />} placeholder="用户名（4-20位字母、数字或下划线）" />
          </Form.Item>

          <Form.Item
            name="name"
            rules={[
              { required: true, message: '请输入姓名' },
              {
                validator: (_, value) => {
                  if (value && validationRules.name.pattern.test(value)) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error(validationRules.name.message))
                }
              }
            ]}
          >
            <Input prefix={<SolutionOutlined />} placeholder="真实姓名" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号码' },
              {
                validator: (_, value) => {
                  if (value && validationRules.phone.pattern.test(value)) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error(validationRules.phone.message))
                }
              }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="手机号码" />
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
            <Input.Password prefix={<LockOutlined />} placeholder="密码（6-20位字母、数字或下划线）" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: '请确认密码' },
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
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: '#666' }}>
            已有账号？
            <a onClick={() => navigate('/login')}>立即登录</a>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Register
