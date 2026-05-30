import React, { useEffect } from 'react'
import { Form, Input, Button, Checkbox, message, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { login, clearError } from '../store/slices/userSlice'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser, error } = useSelector(state => state.user)
  const [form] = Form.useForm()

  useEffect(() => {
    if (currentUser) {
      navigate('/')
    }
    return () => {
      dispatch(clearError())
    }
  }, [currentUser, navigate, dispatch])

  const onFinish = (values) => {
    dispatch(login({ username: values.username, password: values.password }))
  }

  useEffect(() => {
    if (error) {
      message.error(error)
    }
  }, [error])

  const validateUsername = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入用户名'))
    }
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) {
      return Promise.reject(new Error('用户名只能包含字母、数字、下划线，长度4-20位'))
    }
    return Promise.resolve()
  }

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入密码'))
    }
    if (!/^[a-zA-Z0-9_]{6,20}$/.test(value)) {
      return Promise.reject(new Error('密码只能包含字母、数字、下划线，长度6-20位'))
    }
    return Promise.resolve()
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 48 }}>🏛️</span>
        </div>
        <h1 className="login-title">非遗文化遗产平台</h1>
        <p className="login-subtitle">请登录您的账号</p>

        {error && (
          <Alert
            message="登录失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ validator: validateUsername }]}
            hasFeedback
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ validator: validatePassword }]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              style={{ height: 44, fontSize: 16 }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{
          marginTop: 24,
          padding: 16,
          background: '#f6ffed',
          borderRadius: 8,
          border: '1px solid #b7eb8f'
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#389e0d' }}>
            <strong>测试账号：</strong>
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#52c41a' }}>
            管理员：admin / admin123
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#52c41a' }}>
            普通用户：user / user123
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
