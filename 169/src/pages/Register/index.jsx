import React from 'react'
import { Form, Input, Button, Card, Checkbox, Tabs } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { register, login } from '@/store/slices/userSlice'
import { message } from 'antd'

const { TabPane } = Tabs

const Register = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [form] = Form.useForm()

  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve()
      }
      return Promise.reject(new Error('两次输入的密码不一致'))
    }
  })

  const validatePhoneUnique = (_, value) => {
    if (!value) return Promise.resolve()
    const users = JSON.parse(localStorage.getItem('users')) || []
    const exists = users.find((u) => u.phone === value)
    if (exists) {
      return Promise.reject(new Error('该手机号已注册'))
    }
    return Promise.resolve()
  }

  const handleSubmit = (values) => {
    const { phone, password, name, role } = values

    const newUser = {
      id: Date.now(),
      phone,
      password,
      name,
      role,
      avatar:
        role === 'technician'
          ? 'https://img.icons8.com/color/96/worker-male.png'
          : 'https://img.icons8.com/color/96/user-male-circle.png',
      createTime: new Date().toISOString()
    }

    dispatch(register(newUser))
    dispatch(login(newUser))
    message.success('注册成功')
    navigate('/')
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
          <h2 className="login-title">注册账号</h2>
          <Tabs defaultActiveKey="user">
            <TabPane tab="用户注册" key="user">
              <Form
                form={form}
                onFinish={handleSubmit}
                initialValues={{ role: 'user', agreement: true }}
              >
                <Form.Item name="role" hidden>
                  <Input />
                </Form.Item>
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: '请输入姓名' },
                    { pattern: /^[\u4e00-\u9fa5a-zA-Z]{2,}$/, message: '请输入正确的姓名' }
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="请输入姓名" size="large" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                    { validator: validatePhoneUnique }
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
                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    validateConfirmPassword
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请再次输入密码"
                    size="large"
                  />
                </Form.Item>
                <Form.Item name="agreement" valuePropName="checked">
                  <Checkbox>我已阅读并同意《用户协议》和《隐私政策》</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block>
                    注册
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="师傅注册" key="technician">
              <Form
                form={form}
                onFinish={handleSubmit}
                initialValues={{ role: 'technician', agreement: true }}
              >
                <Form.Item name="role" hidden>
                  <Input />
                </Form.Item>
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: '请输入姓名' },
                    { pattern: /^[\u4e00-\u9fa5a-zA-Z]{2,}$/, message: '请输入正确的姓名' }
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="请输入姓名" size="large" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                    { validator: validatePhoneUnique }
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
                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    validateConfirmPassword
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请再次输入密码"
                    size="large"
                  />
                </Form.Item>
                <Form.Item name="agreement" valuePropName="checked">
                  <Checkbox>我已阅读并同意《用户协议》和《隐私政策》</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block>
                    注册
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>

          <div className="login-footer">
            <p>
              已有账号？
              <Button type="link" onClick={() => navigate('/login')}>
                立即登录
              </Button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Register
