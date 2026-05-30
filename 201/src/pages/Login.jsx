import React, { useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Space, Divider, message } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '@/store/slices/userSlice'
import Loading from '@/components/common/Loading'

const { Title, Paragraph } = Typography

const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/
const passwordRegex = /^[a-zA-Z0-9_]{6,20}$/

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { currentUser, loading, error } = useSelector(state => state.user)
  const [form] = Form.useForm()

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true })
    }
    return () => dispatch(clearError())
  }, [currentUser, navigate, from, dispatch])

  const onFinish = async (values) => {
    const result = await dispatch(login(values))
    if (login.fulfilled.match(result)) {
      message.success('登录成功')
      navigate(from, { replace: true })
    }
  }

  const validateUsername = (_, value) => {
    if (!value) {
      return Promise.reject('请输入用户名')
    }
    if (!usernameRegex.test(value)) {
      return Promise.reject('用户名由3-16位字母、数字、下划线组成')
    }
    return Promise.resolve()
  }

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject('请输入密码')
    }
    if (!passwordRegex.test(value)) {
      return Promise.reject('密码由6-20位字母、数字、下划线组成')
    }
    return Promise.resolve()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fdf6e3 0%, #d4c4a8 100%)',
      padding: 24
    }}>
      {loading && <Loading />}
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(139, 69, 19, 0.2)'
        }}
        bodyStyle={{ padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a96e 0%, #8B4513 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: '#fff',
            margin: '0 auto 16px'
          }}>
            矿
          </div>
          <Title level={3} style={{ marginBottom: 8, color: '#5D4037' }}>
            传统矿物颜料展示平台
          </Title>
          <Paragraph style={{ color: '#888', marginBottom: 0 }}>
            请登录您的账号
          </Paragraph>
        </div>

        {error && (
          <Alert
            message="登录失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            closable
            onClose={() => dispatch(clearError())}
          />
        )}

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
              prefix={<UserOutlined style={{ color: '#8B4513' }} />}
              placeholder="请输入用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#8B4513' }} />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<LoginOutlined />}
              style={{
                height: 44,
                fontSize: 16,
                background: 'linear-gradient(135deg, #8B4513 0%, #5D4037 100%)',
                border: 'none'
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '24px 0' }}>演示账号</Divider>

        <Space direction="vertical" size="small" style={{ width: '100%', color: '#666', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>管理员账号：</span>
            <span style={{ color: '#8B4513', fontWeight: 500 }}>admin / admin123</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>研究员账号：</span>
            <span style={{ color: '#8B4513', fontWeight: 500 }}>researcher / user123</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>画家账号：</span>
            <span style={{ color: '#8B4513', fontWeight: 500 }}>artist / user123</span>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default Login
