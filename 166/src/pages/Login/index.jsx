import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Tabs, Checkbox } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined, HomeOutlined } from '@ant-design/icons'
import { login } from '@/store/userSlice'
import { useFormValidation, validators } from '@/hooks'
import './index.scss'

const { TabPane } = Tabs

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('password')
  const [loading, setLoading] = useState(false)

  const {
    values: pwdValues,
    errors: pwdErrors,
    handleChange: pwdHandleChange,
    handleBlur: pwdHandleBlur,
    handleSubmit: pwdHandleSubmit
  } = useFormValidation(
    { username: '', password: '', remember: true },
    {
      username: validators.required('请输入用户名'),
      password: validators.required('请输入密码')
    }
  )

  const {
    values: smsValues,
    errors: smsErrors,
    handleChange: smsHandleChange,
    handleBlur: smsHandleBlur,
    handleSubmit: smsHandleSubmit
  } = useFormValidation(
    { phone: '', code: '', remember: true },
    {
      phone: validators.phone('请输入正确的手机号'),
      code: validators.required('请输入验证码')
    }
  )

  const handlePasswordLogin = async () => {
    const isValid = await pwdHandleSubmit(async (values) => {
      setLoading(true)
      setTimeout(() => {
        dispatch(login({
          username: values.username,
          nickname: '用户' + values.username.slice(-4),
          phone: '138****8888',
          role: 'consumer'
        }))
        setLoading(false)
        message.success('登录成功')
        navigate('/')
      }, 1000)
    })
  }

  const handleSmsLogin = async () => {
    const isValid = await smsHandleSubmit(async (values) => {
      setLoading(true)
      setTimeout(() => {
        dispatch(login({
          phone: values.phone,
          username: values.phone,
          nickname: '用户' + values.phone.slice(-4),
          role: 'consumer'
        }))
        setLoading(false)
        message.success('登录成功')
        navigate('/')
      }, 1000)
    })
  }

  const handleSendCode = () => {
    message.success('验证码已发送：123456')
  }

  return (
    <div className="login-page">
      <div className="login-header">
        <Link to="/" className="logo">
          <span className="logo-icon">🥬</span>
          <span className="logo-text">鲜到家</span>
        </Link>
      </div>

      <Card className="login-card">
        <h2 className="login-title">欢迎登录</h2>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="账号密码登录" key="password">
            <Form layout="vertical" onFinish={handlePasswordLogin}>
              <Form.Item
                label="用户名"
                validateStatus={pwdErrors.username ? 'error' : ''}
                help={pwdErrors.username}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                  size="large"
                  value={pwdValues.username}
                  onChange={(e) => pwdHandleChange('username', e.target.value)}
                  onBlur={() => pwdHandleBlur('username')}
                />
              </Form.Item>

              <Form.Item
                label="密码"
                validateStatus={pwdErrors.password ? 'error' : ''}
                help={pwdErrors.password}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  size="large"
                  value={pwdValues.password}
                  onChange={(e) => pwdHandleChange('password', e.target.value)}
                  onBlur={() => pwdHandleBlur('password')}
                />
              </Form.Item>

              <Form.Item>
                <Checkbox
                  checked={pwdValues.remember}
                  onChange={(e) => pwdHandleChange('remember', e.target.checked)}
                >
                  记住密码
                </Checkbox>
                <span className="forgot-password">忘记密码？</span>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                登录
              </Button>
            </Form>
          </TabPane>

          <TabPane tab="手机号登录" key="sms">
            <Form layout="vertical" onFinish={handleSmsLogin}>
              <Form.Item
                label="手机号"
                validateStatus={smsErrors.phone ? 'error' : ''}
                help={smsErrors.phone}
              >
                <Input
                  prefix={<MobileOutlined />}
                  placeholder="请输入手机号"
                  size="large"
                  value={smsValues.phone}
                  onChange={(e) => smsHandleChange('phone', e.target.value)}
                  onBlur={() => smsHandleBlur('phone')}
                />
              </Form.Item>

              <Form.Item
                label="验证码"
                validateStatus={smsErrors.code ? 'error' : ''}
                help={smsErrors.code}
              >
                <div className="code-input">
                  <Input
                    placeholder="请输入验证码"
                    size="large"
                    value={smsValues.code}
                    onChange={(e) => smsHandleChange('code', e.target.value)}
                    onBlur={() => smsHandleBlur('code')}
                  />
                  <Button
                    size="large"
                    onClick={handleSendCode}
                    disabled={!smsValues.phone || smsValues.phone.length !== 11}
                  >
                    获取验证码
                  </Button>
                </div>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                登录
              </Button>
            </Form>
          </TabPane>
        </Tabs>

        <div className="login-footer">
          还没有账号？<Link to="/register">立即注册</Link>
        </div>
      </Card>
    </div>
  )
}

export default Login
