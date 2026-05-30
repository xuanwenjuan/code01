import { useState } from 'react'
import { Card, Form, Input, Button, Tabs, Radio, message } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined, SafetyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { validatePhone, validatePassword, validateCode } from '@/utils/validation'
import './style.css'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [activeTab, setActiveTab] = useState('password')
  const [loginType, setLoginType] = useState('user')
  const [form] = Form.useForm()
  const [codeForm] = Form.useForm()
  const [countdown, setCountdown] = useState(0)

  const handlePasswordLogin = async () => {
    try {
      const values = await form.validateFields()
      await login({ ...values, role: loginType })
      message.success('登录成功！')
      navigate('/')
    } catch (error) {
      console.log('Login Failed:', error)
    }
  }

  const handleCodeLogin = async () => {
    try {
      const values = await codeForm.validateFields()
      await login({ ...values, role: loginType })
      message.success('登录成功！')
      navigate('/')
    } catch (error) {
      console.log('Login Failed:', error)
    }
  }

  const handleSendCode = () => {
    const phone = codeForm.getFieldValue('phone')
    if (!phone) {
      message.error('请先输入手机号')
      return
    }
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    message.success('验证码已发送')
  }

  const tabItems = [
    {
      key: 'password',
      label: '密码登录',
      children: (
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
          </Form.Item>
          <Button
            type="primary"
            size="large"
            block
            onClick={handlePasswordLogin}
            style={{ height: 48, marginTop: 8 }}
          >
            登录
          </Button>
        </Form>
      )
    },
    {
      key: 'code',
      label: '验证码登录',
      children: (
        <Form form={codeForm} layout="vertical">
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ validator: validatePhone }]}
          >
            <Input prefix={<MobileOutlined />} placeholder="请输入手机号" size="large" />
          </Form.Item>
          <Form.Item
            name="code"
            label="验证码"
            rules={[{ validator: validateCode }]}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                prefix={<SafetyOutlined />}
                placeholder="请输入验证码"
                size="large"
                style={{ flex: 1 }}
              />
              <Button
                size="large"
                disabled={countdown > 0}
                onClick={handleSendCode}
                style={{ minWidth: 120 }}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </div>
          </Form.Item>
          <Button
            type="primary"
            size="large"
            block
            onClick={handleCodeLogin}
            style={{ height: 48, marginTop: 8 }}
          >
            登录
          </Button>
        </Form>
      )
    }
  ]

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>欢迎登录</h1>
          <p>同城生活家政服务平台</p>
        </div>
        <Card bordered={false} className="login-card">
          <div style={{ marginBottom: 24 }}>
            <Radio.Group
              value={loginType}
              onChange={e => setLoginType(e.target.value)}
              style={{ width: '100%' }}
            >
              <Radio.Button value="user" style={{ width: '50%', textAlign: 'center' }}>
                用户登录
              </Radio.Button>
              <Radio.Button value="worker" style={{ width: '50%', textAlign: 'center' }}>
                师傅登录
              </Radio.Button>
            </Radio.Group>
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            centered
          />
          <div style={{ textAlign: 'center', marginTop: 16, color: '#999' }}>
            <p>测试账号：任意用户名 + 密码 123456</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login
