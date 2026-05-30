import { useEffect, useState } from 'react'
import { Form, Input, Button, Card, Radio, message, Alert } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { login, clearError } from '@/store/slices/authSlice'
import Loading from '@/components/Loading'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, isAuthenticated } = useSelector(state => state.auth)
  const [form] = Form.useForm()
  const [role, setRole] = useState('craftsman')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const validateUsername = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入用户名'))
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
      return Promise.reject(new Error('用户名只能包含字母、数字和下划线，3-20位'))
    }
    return Promise.resolve()
  }

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入密码'))
    }
    if (!/^[a-zA-Z0-9_]{6,20}$/.test(value)) {
      return Promise.reject(new Error('密码只能包含字母、数字和下划线，6-20位'))
    }
    return Promise.resolve()
  }

  const onFinish = async (values) => {
    try {
      await dispatch(login(values)).unwrap()
      message.success('登录成功')
      navigate('/')
    } catch (err) {
      message.error(err.message || '登录失败')
    }
  }

  const quickLogin = (username, password) => {
    form.setFieldsValue({ username, password })
  }

  if (loading) {
    return <Loading text="登录中..." />
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #F5DEB3 100%)',
      padding: 20
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          borderRadius: 12
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#8B4513' }}>
            榫卯数字化平台
          </div>
          <div style={{ color: '#666', marginTop: 8 }}>
            传承千年技艺，连接古今智慧
          </div>
        </div>

        {error && (
          <Alert
            message="登录失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => dispatch(clearError())}
          />
        )}

        <Form
          form={form}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ validator: validateUsername }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item label="登录身份">
            <Radio.Group value={role} onChange={(e) => setRole(e.target.value)}>
              <Radio value="craftsman">
                <SafetyOutlined /> 工艺从业者
              </Radio>
              <Radio value="admin">
                <SafetyOutlined /> 管理员
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: '100%', height: 44, fontSize: 16 }}
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
            快速登录测试账号：
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button size="small" onClick={() => quickLogin('craftsman', 'craft123')}>
              工艺师账号
            </Button>
            <Button size="small" onClick={() => quickLogin('admin', 'admin123')}>
              管理员账号
            </Button>
          </div>
          <div style={{ color: '#999', fontSize: 12, marginTop: 12, lineHeight: 1.6 }}>
            <div>工艺师：craftsman / craft123</div>
            <div>管理员：admin / admin123</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Login
