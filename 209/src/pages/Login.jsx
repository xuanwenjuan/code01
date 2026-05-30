import { useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { login, clearError } from '../store/slices/authSlice'
import { validateUsername, validatePassword } from '../utils/validators'

const { Title, Text } = Typography

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector(state => state.auth)
  const [form] = Form.useForm()

  useEffect(() => {
    if (user) {
      navigate('/home')
    }
    return () => {
      dispatch(clearError())
    }
  }, [user, navigate, dispatch])

  const handleSubmit = async (values) => {
    try {
      await dispatch(login(values)).unwrap()
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #D2691E 100%)',
      padding: 24
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}
        styles={{ body: { padding: 40 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏺</div>
          <Title level={2} style={{ margin: 0, color: '#8B4513' }}>
            陶艺云平台
          </Title>
          <Text type="secondary">传统陶艺技艺数字化展示与创作平台</Text>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ validator: validateUsername }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#8B4513' }} />}
              placeholder="请输入用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
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
              style={{
                height: 44,
                fontSize: 16,
                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                border: 'none'
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            <strong>测试账号：</strong>
          </Text>
          <Space direction="vertical" size="small" style={{ marginTop: 8, fontSize: 13 }}>
            <div>
              <Text type="secondary">管理员：</Text>
              <Text code>admin / admin123</Text>
            </div>
            <div>
              <Text type="secondary">陶艺匠人：</Text>
              <Text code>artisan / artisan123</Text>
            </div>
            <div>
              <Text type="secondary">爱好者：</Text>
              <Text code>lover / lover123</Text>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default Login
