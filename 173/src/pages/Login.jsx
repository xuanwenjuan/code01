import React, { useState } from 'react'
import { Form, Input, Button, Card, Tabs, message, Checkbox } from 'antd'
import { UserOutlined, LockOutlined, ToolOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../store/actions/userActions'
import { REGEX } from '../utils/validate'
import { useLoading } from '../hooks/useLoading'
import './Login.less'

const Login = () => {
  const [activeTab, setActiveTab] = useState('user')
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { loading, withLoading } = useLoading()
  const { isLoggedIn } = useSelector(state => state.user)

  const from = location.state?.from?.pathname || '/'

  if (isLoggedIn) {
    navigate(from, { replace: true })
  }

  const handleSubmit = async (values) => {
    const result = await withLoading(() =>
      dispatch(login(values.username, values.password, activeTab))
    )

    if (result?.success) {
      message.success('登录成功')
      const redirectPath = activeTab === 'user'
        ? (from === '/login' ? '/' : from)
        : '/master/orders'
      navigate(redirectPath, { replace: true })
    } else {
      message.error(result?.message || '登录失败')
    }
  }

  const tabsItems = [
    {
      key: 'user',
      label: (
        <span>
          <UserOutlined /> 用户登录
        </span>
      )
    },
    {
      key: 'master',
      label: (
        <span>
          <ToolOutlined /> 师傅登录
        </span>
      )
    }
  ]

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <h1>🔐 同城上门开锁</h1>
          <p>专业开锁 · 修锁 · 换锁服务平台</p>
          <ul>
            <li>✓ 24小时上门服务</li>
            <li>✓ 持证上岗 安全可靠</li>
            <li>✓ 明码标价 无隐形消费</li>
            <li>✓ 专业团队 快速响应</li>
          </ul>
        </div>
        <Card className="login-card">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabsItems}
            centered
          />
          <Form
            name="login"
            onFinish={handleSubmit}
            size="large"
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 4, message: '用户名至少4个字符' },
                { pattern: REGEX.username, message: '用户名只能包含字母、数字和下划线' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
                { pattern: REGEX.password, message: '密码只能包含字母、数字和下划线' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>记住我</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
              >
                登 录
              </Button>
            </Form.Item>

            <p className="login-tip">
              提示：任意用户名和密码（6位以上）即可登录体验
            </p>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default Login
