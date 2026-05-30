import React from 'react'
import { Form, Input, Button, Card, Checkbox, Tabs } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useDispatch } from 'react-redux'
import { login } from '@/store/slices/userSlice'
import { message } from 'antd'

const { TabPane } = Tabs

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [form] = Form.useForm()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = (values) => {
    const { phone, password, role } = values

    if (phone === '13800138000' && password === '123456') {
      const user = {
        id: 1,
        phone,
        password,
        name: '测试用户',
        role: 'user',
        avatar: 'https://img.icons8.com/color/96/user-male-circle.png',
        createTime: new Date().toISOString()
      }
      dispatch(login(user))
      message.success('登录成功')
      navigate(from, { replace: true })
      return
    }

    if (phone === '13900139000' && password === '123456') {
      const user = {
        id: 2,
        phone,
        password,
        name: '张师傅',
        role: 'technician',
        avatar: 'https://img.icons8.com/color/96/worker-male.png',
        createTime: new Date().toISOString()
      }
      dispatch(login(user))
      message.success('登录成功')
      navigate(from, { replace: true })
      return
    }

    const users = JSON.parse(localStorage.getItem('users')) || []
    const user = users.find((u) => u.phone === phone && u.password === password)

    if (user) {
      dispatch(login(user))
      message.success('登录成功')
      navigate(from, { replace: true })
    } else {
      message.error('手机号或密码错误')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <span className="logo-icon">🔧</span>
            <h1>同城家电维修</h1>
            <p>专业维修，服务到家</p>
          </div>
          <div className="login-features">
            <div className="feature">
              <span className="feature-icon">🛡️</span>
              <p>30天质保</p>
            </div>
            <div className="feature">
              <span className="feature-icon">⏱️</span>
              <p>快速响应</p>
            </div>
            <div className="feature">
              <span className="feature-icon">💰</span>
              <p>明码标价</p>
            </div>
          </div>
        </div>

        <Card className="login-card">
          <h2 className="login-title">欢迎登录</h2>
          <Tabs defaultActiveKey="user">
            <TabPane tab="用户登录" key="user">
              <Form
                form={form}
                onFinish={handleSubmit}
                initialValues={{ role: 'user', remember: true }}
              >
                <Form.Item name="role" hidden>
                  <Input />
                </Form.Item>
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" size="large" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码长度不能少于6位' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                    size="large"
                  />
                </Form.Item>
                <Form.Item name="remember" valuePropName="checked">
                  <Checkbox>记住密码</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block>
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="师傅登录" key="technician">
              <Form
                form={form}
                onFinish={handleSubmit}
                initialValues={{ role: 'technician', remember: true }}
              >
                <Form.Item name="role" hidden>
                  <Input />
                </Form.Item>
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" size="large" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码长度不能少于6位' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                    size="large"
                  />
                </Form.Item>
                <Form.Item name="remember" valuePropName="checked">
                  <Checkbox>记住密码</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block>
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>

          <div className="login-footer">
            <p>
              还没有账号？
              <Button type="link" onClick={() => navigate('/register')}>
                立即注册
              </Button>
            </p>
            <p className="test-accounts">
              测试账号：13800138000 / 123456（用户）<br />
              13900139000 / 123456（师傅）
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login
