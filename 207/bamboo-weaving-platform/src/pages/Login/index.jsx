import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Tabs, message, Alert } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { login, register } from '@/store/slices/userSlice'
import StatusHandler from '@/components/StatusHandler'

const Login = () => {
  const [activeTab, setActiveTab] = useState('login')
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser, status, error } = useSelector(state => state.user)

  useEffect(() => {
    if (currentUser) {
      navigate('/')
    }
  }, [currentUser, navigate])

  const handleLogin = async (values) => {
    try {
      const result = await dispatch(login(values)).unwrap()
      message.success(`欢迎回来，${result.nickname}！`)
      navigate('/')
    } catch (err) {
      message.error(err)
    }
  }

  const handleRegister = async (values) => {
    try {
      const result = await dispatch(register(values)).unwrap()
      message.success(`注册成功，欢迎加入，${result.nickname}！`)
      navigate('/')
    } catch (err) {
      message.error(err)
    }
  }

  const loginItems = [
    {
      name: 'username',
      label: '用户名',
      rules: [{ required: true, message: '请输入用户名' }],
      icon: <UserOutlined />,
      placeholder: '请输入用户名'
    },
    {
      name: 'password',
      label: '密码',
      rules: [{ required: true, message: '请输入密码' }],
      icon: <LockOutlined />,
      placeholder: '请输入密码',
      isPassword: true
    }
  ]

  const registerItems = [
    {
      name: 'username',
      label: '用户名',
      rules: [
        { required: true, message: '请输入用户名' },
        { pattern: /^[a-zA-Z0-9_]{4,16}$/, message: '用户名只能包含字母、数字和下划线，4-16位' }
      ],
      icon: <UserOutlined />,
      placeholder: '4-16位字母、数字或下划线'
    },
    {
      name: 'nickname',
      label: '昵称',
      rules: [
        { required: true, message: '请输入昵称' },
        { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/, message: '昵称只能包含中文、字母、数字和下划线，2-20位' }
      ],
      icon: <UserOutlined />,
      placeholder: '请输入昵称'
    },
    {
      name: 'password',
      label: '密码',
      rules: [
        { required: true, message: '请输入密码' },
        { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/, message: '密码必须包含字母和数字，6-20位' }
      ],
      icon: <LockOutlined />,
      placeholder: '6-20位，包含字母和数字',
      isPassword: true
    },
    {
      name: 'confirmPassword',
      label: '确认密码',
      dependencies: ['password'],
      rules: [
        { required: true, message: '请确认密码' },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve()
            }
            return Promise.reject(new Error('两次输入的密码不一致'))
          }
        })
      ],
      icon: <LockOutlined />,
      placeholder: '请再次输入密码',
      isPassword: true
    },
    {
      name: 'phone',
      label: '手机号',
      rules: [
        { required: true, message: '请输入手机号' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
      ],
      icon: <PhoneOutlined />,
      placeholder: '请输入11位手机号'
    },
    {
      name: 'email',
      label: '邮箱',
      rules: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '请输入有效的邮箱地址' }
      ],
      icon: <MailOutlined />,
      placeholder: '请输入邮箱地址'
    }
  ]

  const renderFormItems = (items) => {
    return items.map(item => (
      <Form.Item
        key={item.name}
        name={item.name}
        label={item.label}
        rules={item.rules}
        dependencies={item.dependencies}
      >
        <Input
          prefix={item.icon}
          placeholder={item.placeholder}
          type={item.isPassword ? 'password' : 'text'}
          size="large"
        />
      </Form.Item>
    ))
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f5e9 0%, #d9f7be 100%)'
    }}>
      <Card 
        style={{ 
          width: 450, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 12
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, color: '#389e0d', marginBottom: 8 }}>🎋 竹编技艺平台</h1>
          <p style={{ color: '#888' }}>传承千年技艺，编织美好生活</p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            { key: 'login', label: '登录' },
            { key: 'register', label: '注册' }
          ]}
        />

        {error && activeTab === 'login' && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
        )}

        <Form
          form={form}
          onFinish={activeTab === 'login' ? handleLogin : handleRegister}
          layout="vertical"
          size="large"
        >
          {activeTab === 'login' ? renderFormItems(loginItems) : renderFormItems(registerItems)}
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={status === 'loading'}
            >
              {activeTab === 'login' ? '登录' : '注册'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: '#888', fontSize: 12, marginTop: 16 }}>
          <p>测试账号：</p>
          <p>管理员：admin / admin123</p>
          <p>普通用户：learner1 / 123456</p>
        </div>
      </Card>
    </div>
  )
}

export default Login
