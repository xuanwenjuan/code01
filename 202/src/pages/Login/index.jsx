import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Space, Radio, Divider } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { login, clearError } from '../../store/slices/authSlice'
import Loading from '../../components/Loading'

const { Title, Text } = Typography

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)
  const [form] = Form.useForm()
  const [loginType, setLoginType] = useState('user')

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleSubmit = async (values) => {
    try {
      await dispatch(login(values)).unwrap()
    } catch (err) {
      console.error('登录失败:', err)
    }
  }

  const handleTypeChange = (e) => {
    const type = e.target.value
    setLoginType(type)
    if (type === 'admin') {
      form.setFieldsValue({ username: 'admin', password: 'admin123' })
    } else if (type === 'inheritor') {
      form.setFieldsValue({ username: 'inheritor', password: 'inherit123' })
    } else {
      form.setFieldsValue({ username: 'user1', password: 'user123' })
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 50%, #d4c4a0 100%)',
        padding: '24px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 12px 40px rgba(139, 105, 20, 0.2)',
          borderRadius: '12px',
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
          <Title level={2} style={{ marginBottom: '8px', color: '#8B6914' }}>
            古法造纸技艺
            <br />
            数字化档案平台
          </Title>
          <Text type="secondary">请登录以继续访问</Text>
        </div>

        {error && (
          <Alert
            message="登录失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
            closable
            onClose={() => dispatch(clearError())}
          />
        )}

        <Form
          form={form}
          onFinish={handleSubmit}
          initialValues={{ username: 'user1', password: 'user123' }}
          size="large"
        >
          <Form.Item
            label="登录身份"
            name="loginType"
            initialValue="user"
            style={{ marginBottom: '24px' }}
          >
            <Radio.Group onChange={handleTypeChange} value={loginType} style={{ width: '100%' }}>
              <Radio.Button value="user" style={{ width: '33.33%', textAlign: 'center' }}>
                普通用户
              </Radio.Button>
              <Radio.Button value="admin" style={{ width: '33.33%', textAlign: 'center' }}>
                管理员
              </Radio.Button>
              <Radio.Button value="inheritor" style={{ width: '33.33%', textAlign: 'center' }}>
                传承人
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度为3-20个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
            ]}
            style={{ marginBottom: '16px' }}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度为6-20个字符' },
            ]}
            style={{ marginBottom: '24px' }}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', height: '44px', fontSize: '16px' }}
            >
              {loading ? '登录中...' : '登 录'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>测试账号</Divider>
        <Space direction="vertical" size="small" style={{ width: '100%', fontSize: '12px' }}>
          <Text type="secondary">管理员：admin / admin123</Text>
          <Text type="secondary">传承人：inheritor / inherit123</Text>
          <Text type="secondary">普通用户：user1 / user123</Text>
        </Space>
      </Card>
    </div>
  )
}

export default Login
