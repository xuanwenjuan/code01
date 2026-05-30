import React, { useEffect } from 'react'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { login, clearError, selectUserLoading, selectUserError, selectCurrentUser } from '@/store/slices/userSlice'
import { Loading } from '@/components'

const { Title, Text } = Typography

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()

  const loading = useSelector(selectUserLoading)
  const error = useSelector(selectUserError)
  const user = useSelector(selectCurrentUser)

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onFinish = async (values) => {
    const result = await dispatch(login(values))
    if (login.fulfilled.match(result)) {
      message.success('登录成功')
      navigate(from, { replace: true })
    }
  }

  const validateUsername = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入用户名'))
    }
    if (value.length < 3) {
      return Promise.reject(new Error('用户名长度至少3位'))
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
    return Promise.resolve()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 32,
            color: '#fff'
          }}>
            🚚
          </div>
          <Title level={3} style={{ marginBottom: 8 }}>物流货物跟踪平台</Title>
          <Text type="secondary">请登录您的账号继续</Text>
        </div>

        {loading ? (
          <Loading tip="登录中..." />
        ) : (
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[{ validator: validateUsername }]}
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
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button type="primary" htmlType="submit" block loading={loading}>
                登 录
              </Button>
            </Form.Item>

            <div style={{
              background: '#f5f5f5',
              borderRadius: 8,
              padding: 12,
              fontSize: 12,
              color: '#666'
            }}>
              <p style={{ margin: 0, fontWeight: 500, marginBottom: 8 }}>测试账号：</p>
              <p style={{ margin: '4px 0' }}>管理员：admin / admin123</p>
              <p style={{ margin: '4px 0' }}>跟单员：tracker01 / tracker123</p>
              <p style={{ margin: '4px 0' }}>跟单员：tracker02 / tracker123</p>
            </div>
          </Form>
        )}
      </Card>
    </div>
  )
}

export default Login
