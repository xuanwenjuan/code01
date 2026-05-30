import React from 'react'
import { Form, Input, Button, Card, Radio, message } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '@/store/slices/userSlice'
import { validatePhone, validatePassword, validateConfirmPassword, validateName, validateEmail } from '@/utils/validate'

const Register = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  const handleRegister = async (values) => {
    setLoading(true)
    try {
      const { confirmPassword, ...registerData } = values
      dispatch(register(registerData))
      message.success('注册成功！请登录')
      setTimeout(() => {
        navigate('/login')
      }, 1000)
    } catch (error) {
      message.error(error.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Card
        style={{ width: '100%', maxWidth: 480, borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
        styles={{ body: { padding: 32 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, color: '#ff6b35', marginBottom: 8 }}>🐾 注册账号</h1>
          <p style={{ color: '#666' }}>加入宠物服务平台，为您的爱宠找到优质服务</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
          initialValues={{ userType: 'owner' }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ validator: validateName }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
          </Form.Item>

          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ validator: validateName }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入昵称" size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ validator: validatePhone }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱（选填）"
            rules={[{ validator: validateEmail }]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码（6-20位）" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[{ validator: validateConfirmPassword(() => form.getFieldValue('password')) }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" size="large" />
          </Form.Item>

          <Form.Item
            name="userType"
            label="注册身份"
          >
            <Radio.Group size="large" style={{ width: '100%' }}>
              <Radio.Button value="owner" style={{ width: '50%', textAlign: 'center' }}>
                我是宠主
              </Radio.Button>
              <Radio.Button value="groomer" style={{ width: '50%', textAlign: 'center' }}>
                我是宠物师
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ height: 48, fontSize: 16 }}
            >
              立即注册
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: '#666' }}>
          已有账号？<Link to="/login">立即登录</Link>
        </div>
      </Card>
    </div>
  )
}

export default Register
