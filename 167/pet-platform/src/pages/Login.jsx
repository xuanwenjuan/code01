import React, { useState } from 'react'
import { Form, Input, Button, Card, Tabs, Radio, message } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login, register } from '@/store/slices/userSlice'
import { validatePhone, validatePassword, validateConfirmPassword, validateName } from '@/utils/validate'

const { TabPane } = Tabs

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('login')
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      dispatch(login(values))
      message.success('登录成功！')
      setTimeout(() => {
        navigate('/')
      }, 500)
    } catch (error) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values) => {
    setLoading(true)
    try {
      const { confirmPassword, ...registerData } = values
      dispatch(register(registerData))
      message.success('注册成功！')
      setActiveTab('login')
      loginForm.setFieldsValue({
        phone: values.phone,
        userType: values.userType,
      })
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
        style={{ width: '100%', maxWidth: 420, borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
        styles={{ body: { padding: 32 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, color: '#ff6b35', marginBottom: 8 }}>🐾 宠物服务平台</h1>
          <p style={{ color: '#666' }}>专业的同城宠物服务预约平台</p>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} centered size="large">
          <TabPane tab="登录" key="login">
            <Form
              form={loginForm}
              layout="vertical"
              onFinish={handleLogin}
              initialValues={{ userType: 'owner' }}
            >
              <Form.Item
                name="phone"
                label="手机号"
                rules={[{ validator: validatePhone }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[{ validator: validatePassword }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
              </Form.Item>

              <Form.Item
                name="userType"
                label="用户类型"
              >
                <Radio.Group size="large" style={{ width: '100%' }}>
                  <Radio.Button value="owner" style={{ width: '50%', textAlign: 'center' }}>
                    宠主
                  </Radio.Button>
                  <Radio.Button value="groomer" style={{ width: '50%', textAlign: 'center' }}>
                    宠物师
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
                  登录
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', color: '#999', fontSize: 14 }}>
              测试账号：13800138001 / 123456 (宠主)
              <br />
              测试账号：13900139001 / 123456 (宠物师)
            </div>
          </TabPane>

          <TabPane tab="注册" key="register">
            <Form
              form={registerForm}
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
                name="phone"
                label="手机号"
                rules={[{ validator: validatePhone }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[{ validator: validatePassword }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['password']}
                rules={[{ validator: validateConfirmPassword(() => registerForm.getFieldValue('password')) }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" size="large" />
              </Form.Item>

              <Form.Item
                name="userType"
                label="注册身份"
              >
                <Radio.Group size="large" style={{ width: '100%' }}>
                  <Radio.Button value="owner" style={{ width: '50%', textAlign: 'center' }}>
                    宠主
                  </Radio.Button>
                  <Radio.Button value="groomer" style={{ width: '50%', textAlign: 'center' }}>
                    宠物师
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
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>

        <div style={{ textAlign: 'center', marginTop: 16, color: '#666' }}>
          <Link to="/">返回首页</Link>
        </div>
      </Card>
    </div>
  )
}

export default Login
