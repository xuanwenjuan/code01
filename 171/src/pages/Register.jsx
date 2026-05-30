import { useEffect, useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Tabs, Divider } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { phoneRegex, passwordRegex, nameRegex } from '@/hooks/useFormValidation'

const { Title, Text } = Typography

function Register() {
  const navigate = useNavigate()
  const { register, currentUser, error, clearError } = useAuth()
  const [activeTab, setActiveTab] = useState('user')
  const [form] = Form.useForm()

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'user') {
        navigate('/user')
      } else if (currentUser.role === 'cleaner') {
        navigate('/cleaner')
      }
    }
  }, [currentUser, navigate])

  useEffect(() => {
    if (error) {
      message.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleSubmit = (values) => {
    const { confirmPassword, ...rest } = values
    register({
      ...rest,
      role: activeTab,
    })
  }

  const validateConfirmPassword = (_, value) => {
    if (!value) {
      return Promise.reject('请确认密码')
    }
    if (value !== form.getFieldValue('password')) {
      return Promise.reject('两次密码输入不一致')
    }
    return Promise.resolve()
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          borderRadius: 12,
        }}
        bodyStyle={{ padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧹</div>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            注册账号
          </Title>
          <Text type="secondary">加入洁家，享受优质服务</Text>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            { key: 'user', label: '用户注册' },
            { key: 'cleaner', label: '保洁师注册' },
          ]}
        />

        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: '请输入姓名' },
              { pattern: nameRegex, message: '姓名2-20位，支持中英文数字' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入姓名" maxLength={20} />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: phoneRegex, message: '请输入正确的手机号' },
            ]}
          >
            <Input prefix={<MobileOutlined />} placeholder="请输入手机号" maxLength={11} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { pattern: passwordRegex, message: '密码长度6-20位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[{ validator: validateConfirmPassword }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请确认密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{ height: 48, fontSize: 16 }}>
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary">已有账号？</Text>
        </Divider>

        <Link to="/login">
          <Button block style={{ height: 44 }}>
            立即登录
          </Button>
        </Link>
      </Card>
    </div>
  )
}

export default Register
