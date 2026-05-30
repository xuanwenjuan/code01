import React, { useState } from 'react'
import { Form, Input, Button, Card, Tabs, Radio, message } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { formRules } from '@/utils/regex'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { handleLogin, handleRegister } = useAuth()
  const [activeTab, setActiveTab] = useState('login')
  const [role, setRole] = useState('mom')
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()

  const from = location.state?.from?.pathname || '/'

  const handleLoginSubmit = async (values) => {
    const success = await handleLogin({ ...values, role })
    if (success) {
      navigate(from, { replace: true })
    }
  }

  const handleRegisterSubmit = async (values) => {
    const { confirmPassword, ...registerData } = values
    const success = await handleRegister({ ...registerData, role })
    if (success) {
      setActiveTab('login')
      loginForm.setFieldsValue({ phone: registerData.phone })
      message.success('注册成功，请登录')
    }
  }

  const loginItems = [
    {
      label: '手机号',
      name: 'phone',
      rules: formRules.phone,
      input: <Input prefix={<MobileOutlined />} placeholder="请输入手机号" size="large" />
    },
    {
      label: '密码',
      name: 'password',
      rules: [{ required: true, message: '请输入密码' }],
      input: <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
    }
  ]

  const registerItems = [
    {
      label: '昵称',
      name: 'nickname',
      rules: [{ required: true, message: '请输入昵称' }],
      input: <Input prefix={<UserOutlined />} placeholder="请输入昵称" size="large" />
    },
    {
      label: '手机号',
      name: 'phone',
      rules: formRules.phone,
      input: <Input prefix={<MobileOutlined />} placeholder="请输入手机号" size="large" />
    },
    {
      label: '密码',
      name: 'password',
      rules: formRules.password,
      input: <Input.Password prefix={<LockOutlined />} placeholder="请输入密码（6-20位，包含字母和数字）" size="large" />
    },
    {
      label: '确认密码',
      name: 'confirmPassword',
      rules: formRules.confirmPassword(registerForm.getFieldValue),
      input: <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" size="large" />
    }
  ]

  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #fff5f8 0%, #ffe8f0 100%)'
    }}>
      <Card
        className="card-shadow"
        style={{ width: 420 }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fb1 100%)',
          padding: '30px 24px',
          textAlign: 'center',
          color: '#fff',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}>
          <h2 style={{ color: '#fff', fontSize: 24, marginBottom: 4 }}>
            💕 母婴服务平台
          </h2>
          <p style={{ opacity: 0.9, marginBottom: 0 }}>专业的同城母婴服务预约平台</p>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>选择登录身份</div>
            <Radio.Group
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%' }}
            >
              <Radio.Button value="mom" style={{ width: '50%', textAlign: 'center' }}>
                👩 我是宝妈
              </Radio.Button>
              <Radio.Button value="nanny" style={{ width: '50%', textAlign: 'center' }}>
                👩‍🍼 我是母婴师
              </Radio.Button>
            </Radio.Group>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              {
                key: 'login',
                label: '登录',
                children: (
                  <Form
                    form={loginForm}
                    onFinish={handleLoginSubmit}
                    layout="vertical"
                    size="large"
                  >
                    {loginItems.map((item, index) => (
                      <Form.Item key={index} label={item.label} name={item.name} rules={item.rules}>
                        {item.input}
                      </Form.Item>
                    ))}
                    <Form.Item>
                      <Button type="primary" htmlType="submit" block size="large">
                        登录
                      </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center', color: '#999', fontSize: 13 }}>
                      测试账号：13800138000 / 123456（宝妈）<br />
                      测试账号：13900139000 / 123456（母婴师）
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
                    onFinish={handleRegisterSubmit}
                    layout="vertical"
                    size="large"
                  >
                    {registerItems.map((item, index) => (
                      <Form.Item key={index} label={item.label} name={item.name} rules={item.rules}>
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
            ]}
          />
        </div>
      </Card>
    </div>
  )
}

export default Login
