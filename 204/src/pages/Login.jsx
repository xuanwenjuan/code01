import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Input, Button, Card, Tabs, message, Alert } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { login, register, clearError } from '../store/slices/userSlice'
import LoadingState from '../components/LoadingState'

const { TabPane } = Tabs

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { currentUser, loading, error } = useSelector(state => state.user)
  const [activeTab, setActiveTab] = useState('login')
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()

  useEffect(() => {
    if (currentUser) {
      const from = location.state?.from?.pathname || '/'
      navigate(from)
    }
  }, [currentUser, navigate, location])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleLogin = async (values) => {
    const result = await dispatch(login(values))
    if (login.fulfilled.match(result)) {
      message.success('登录成功')
    }
  }

  const handleRegister = async (values) => {
    const result = await dispatch(register(values))
    if (register.fulfilled.match(result)) {
      message.success('注册成功')
    }
  }

  const validateUsername = (_, value) => {
    if (!value) {
      return Promise.resolve()
    }
    const usernameRegex = /^[a-zA-Z0-9_]{4,16}$/
    if (!usernameRegex.test(value)) {
      return Promise.reject('用户名只能包含字母、数字和下划线，长度4-16位')
    }
    return Promise.resolve()
  }

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.resolve()
    }
    if (value.length < 6) {
      return Promise.reject('密码长度不能少于6位')
    }
    return Promise.resolve()
  }

  const validateEmail = (_, value) => {
    if (!value) {
      return Promise.resolve()
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return Promise.reject('请输入有效的邮箱地址')
    }
    return Promise.resolve()
  }

  if (loading) {
    return <LoadingState text={activeTab === 'login' ? '登录中...' : '注册中...'} />
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 134px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f7ee 0%, #e8f5e9 100%)',
      padding: 24
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 450,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4a7c43 0%, #2d5a27 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            margin: '0 auto 16px'
          }}>
            🌿
          </div>
          <h2 style={{ color: '#2d5a27', marginBottom: 8 }}>草木染交流平台</h2>
          <p style={{ color: '#666' }}>传承千年技艺 · 绽放草木芳华</p>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
        )}

        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <TabPane tab="登录" key="login">
            <Form
              form={loginForm}
              name="login"
              onFinish={handleLogin}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { validator: validateUsername }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名" 
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { validator: validatePassword }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  登录
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
              <p>测试账号：</p>
              <p>管理员：admin / admin123</p>
              <p>普通用户：user1 / user123</p>
            </div>
          </TabPane>

          <TabPane tab="注册" key="register">
            <Form
              form={registerForm}
              name="register"
              onFinish={handleRegister}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { validator: validateUsername }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名（4-16位字母数字下划线）" 
                />
              </Form.Item>

              <Form.Item
                name="name"
                rules={[
                  { required: true, message: '请输入姓名' },
                  { min: 2, message: '姓名至少2个字符' }
                ]}
              >
                <Input 
                  placeholder="真实姓名" 
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { validator: validateEmail }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="邮箱地址" 
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { validator: validatePassword }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码（至少6位）"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject('两次输入的密码不一致')
                    }
                  })
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="确认密码"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default Login
