import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Card, Tabs, message, Alert } from 'antd'
import { UserOutlined, LockOutlined, SafetyCertificateOutlined, InfoCircleOutlined } from '@ant-design/icons'
import useAuth from '@/hooks/useAuth'
import { validatePhone, validatePassword } from '@/utils/validator'
import './index.css'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, userInfo } = useAuth()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('user')

  const from = location.state?.from?.pathname || (role === 'worker' ? '/worker/orders' : '/')
  const loginMessage = location.state?.message

  useEffect(() => {
    if (userInfo) {
      const defaultPath = userInfo.role === 'worker' ? '/worker/orders' : '/'
      navigate(defaultPath, { replace: true })
    }
  }, [userInfo, navigate])

  useEffect(() => {
    if (loginMessage) {
      message.info(loginMessage)
    }
  }, [loginMessage])

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const success = await login(values.username, values.password, role)
      if (success) {
        const targetPath = role === 'worker' ? '/worker/orders' : from
        navigate(targetPath, { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (key) => {
    setRole(key)
  }

  const tabItems = [
    {
      key: 'user',
      label: (
        <span>
          <UserOutlined />
          用户登录
        </span>
      )
    },
    {
      key: 'worker',
      label: (
        <span>
          <SafetyCertificateOutlined />
          师傅登录
        </span>
      )
    }
  ]

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <span className="brand-icon">🧹</span>
            <h1 className="brand-title">洁家帮</h1>
            <p className="brand-subtitle">专业家电清洗服务平台</p>
          </div>
          <div className="login-features">
            <div className="feature">
              <div className="feature-icon">✅</div>
              <div>
                <h4>专业服务</h4>
                <p>持证师傅上门服务</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">💰</div>
              <div>
                <h4>透明定价</h4>
                <p>无隐藏收费项目</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🛡️</div>
              <div>
                <h4>售后保障</h4>
                <p>服务不满意可返工</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <Card className="login-card">
            {loginMessage && (
              <Alert
                message="提示"
                description={loginMessage}
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                className="mb-4"
              />
            )}
            
            <Tabs
              activeKey={role}
              onChange={handleRoleChange}
              items={tabItems}
              centered
              className="login-tabs"
            />
            
            <Form
              name="login"
              onFinish={handleSubmit}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ validator: validatePhone }]}
                initialValue={role === 'user' ? 'user' : 'worker'}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入手机号/账号"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ validator: validatePassword }]}
                initialValue="123456"
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="login-btn"
                >
                  登录
                </Button>
              </Form.Item>
            </Form>

            <div className="login-tips">
              <p>测试账号：</p>
              <p>用户：user / 123456</p>
              <p>师傅：worker / 123456</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Login
