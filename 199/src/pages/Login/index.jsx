import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Input, Button, Card, message, Typography, Alert } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { login } from '@/store/slices/userSlice'
import './index.css'

const { Title, Text } = Typography

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { status, error } = useSelector(state => state.user)
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    try {
      const resultAction = await dispatch(login(values))
      if (login.fulfilled.match(resultAction)) {
        message.success('登录成功')
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    } catch (err) {
      message.error('登录失败，请稍后重试')
    }
  }

  const validateUsername = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入用户名'))
    }
    if (value.length < 3 || value.length > 20) {
      return Promise.reject(new Error('用户名长度为3-20个字符'))
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return Promise.reject(new Error('用户名只能包含字母、数字和下划线'))
    }
    return Promise.resolve()
  }

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入密码'))
    }
    if (value.length < 6) {
      return Promise.reject(new Error('密码长度至少6位'))
    }
    if (!/[a-zA-Z]/.test(value)) {
      return Promise.reject(new Error('密码必须包含至少一个字母'))
    }
    if (!/[0-9]/.test(value)) {
      return Promise.reject(new Error('密码必须包含至少一个数字'))
    }
    return Promise.resolve()
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <div className="logo">🌸</div>
          <Title level={2} className="login-title">香韵千年</Title>
          <Text type="secondary" className="login-subtitle">传承千年香道文化</Text>
        </div>

        {error && (
          <Alert
            message="登录失败"
            description={error}
            type="error"
            showIcon
            className="login-alert"
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          className="login-form"
        >
          <Form.Item
            name="username"
            rules={[{ validator: validateUsername }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              maxLength={20}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              maxLength={20}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={status === 'loading'}
              icon={<LoginOutlined />}
              block
              className="login-btn"
            >
              {status === 'loading' ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>

        <div className="login-tips">
          <Text type="secondary">
            测试账号：
          </Text>
          <div className="tip-item">
            <Text strong>管理员：</Text>
            <Text>admin / admin123</Text>
          </div>
          <div className="tip-item">
            <Text strong>普通用户：</Text>
            <Text>user1 / user1234</Text>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Login
