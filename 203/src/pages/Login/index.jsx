import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Tabs, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SafetyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, register } from '@/store/slices/userSlice'
import { validateUsername, validatePassword, validateEmail, validatePhone, validateName, validateConfirmPassword } from '@/utils/validate'
import './index.css'

const Login = () => {
  const [activeTab, setActiveTab] = useState('login')
  const [form] = Form.useForm()
  const [registerForm] = Form.useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.user)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async (values) => {
    const result = await dispatch(login(values))
    if (login.fulfilled.match(result)) {
      message.success('登录成功')
      navigate('/')
    }
  }

  const handleRegister = async (values) => {
    const { confirmPassword, ...userData } = values
    const result = await dispatch(register(userData))
    if (register.fulfilled.match(result)) {
      message.success('注册成功')
      navigate('/')
    }
  }

  const loginItems = [
    {
      name: 'username',
      label: '用户名',
      rules: [
        { required: true, message: '请输入用户名' },
        { validator: (_, value) => {
          const error = validateUsername(value)
          return error ? Promise.reject(error) : Promise.resolve()
        }}
      ],
      input: <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
    },
    {
      name: 'password',
      label: '密码',
      rules: [
        { required: true, message: '请输入密码' },
        { validator: (_, value) => {
          const error = validatePassword(value)
          return error ? Promise.reject(error) : Promise.resolve()
        }}
      ],
      input: <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
    }
  ]

  const registerItems = [
    {
      name: 'username',
      label: '用户名',
      rules: [
        { required: true, message: '请输入用户名' },
        { validator: (_, value) => {
          const error = validateUsername(value)
          return error ? Promise.reject(error) : Promise.resolve()
        }}
      ],
      input: <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
    },
    {
      name: 'name',
      label: '姓名',
      rules: [
        { required: true, message: '请输入姓名' },
        { validator: (_, value) => {
          const error = validateName(value)
          return error ? Promise.reject(error) : Promise.resolve()
        }}
      ],
      input: <Input prefix={<SafetyOutlined />} placeholder="请输入真实姓名" size="large" />
    },
    {
      name: 'email',
      label: '邮箱',
      rules: [
        { required: true, message: '请输入邮箱' },
        { validator: (_, value) => {
          const error = validateEmail(value)
          return error ? Promise.reject(error) : Promise.resolve()
        }}
      ],
      input: <Input prefix={<MailOutlined />} placeholder="请输入邮箱" size="large" />
    },
    {
      name: 'phone',
      label: '手机号',
      rules: [
        { required: true, message: '请输入手机号' },
        { validator: (_, value) => {
          const error = validatePhone(value)
          return error ? Promise.reject(error) : Promise.resolve()
        }}
      ],
      input: <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" size="large" />
    },
    {
      name: 'password',
      label: '密码',
      rules: [
        { required: true, message: '请输入密码' },
        { validator: (_, value) => {
          const error = validatePassword(value)
          return error ? Promise.reject(error) : Promise.resolve()
        }}
      ],
      input: <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
    },
    {
      name: 'confirmPassword',
      label: '确认密码',
      dependencies: ['password'],
      rules: [
        { required: true, message: '请确认密码' },
        { validator: (_, value) => {
          const password = registerForm.getFieldValue('password')
          const error = validateConfirmPassword(password, value)
          return error ? Promise.reject(error) : Promise.resolve()
        }}
      ],
      input: <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" size="large" />
    }
  ]

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          {loginItems.map(item => (
            <Form.Item key={item.name} name={item.name} label={item.label} rules={item.rules}>
              {item.input}
            </Form.Item>
          ))}
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
          <div className="login-tips">
            <p>测试账号：admin / admin123（管理员）</p>
            <p>测试账号：researcher / 123456（研究者）</p>
          </div>
        </Form>
      )
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form
          form={registerForm}
          onFinish={handleRegister}
          layout="vertical"
          size="large"
        >
          {registerItems.map(item => (
            <Form.Item
              key={item.name}
              name={item.name}
              label={item.label}
              rules={item.rules}
              dependencies={item.dependencies}
            >
              {item.input}
            </Form.Item>
          ))}
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              注册
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ]

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-logo">
            <h1>木活字印刷</h1>
            <p>数字化展示平台</p>
          </div>
          <div className="login-intro">
            <h2>传承千年技艺 · 弘扬中华文化</h2>
            <p>探索木活字印刷的奥秘，感受传统技艺的魅力</p>
          </div>
        </div>
        <div className="login-right">
          <Card className="login-card">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              centered
              size="large"
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Login
