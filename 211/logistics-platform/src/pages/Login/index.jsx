import React, { useEffect } from 'react'
import { Form, Input, Button, Card, message, Spin, Alert } from 'antd'
import { UserOutlined, LockOutlined, TruckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../../store/slices/authSlice.js'

const Login = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, isLoggedIn } = useSelector(state => state.auth)

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard')
    }
    return () => {
      dispatch(clearError())
    }
  }, [isLoggedIn, navigate, dispatch])

  const onFinish = async (values) => {
    try {
      await dispatch(login(values)).unwrap()
      message.success('登录成功')
      navigate('/dashboard')
    } catch (err) {
      message.error(err || '登录失败')
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        <div className="login-title">
          <TruckOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <div>物流订单管理平台</div>
          <div style={{ fontSize: 14, color: '#999', marginTop: 8, fontWeight: 'normal' }}>Logistics Order Management System</div>
        </div>
        
        {error && (
          <Alert
            message="登录失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => dispatch(clearError())}
          />
        )}
        
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度在 6 到 20 个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              allowClear
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              size="large"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ marginTop: 24, padding: 12, background: '#f5f5f5', borderRadius: 8, fontSize: 12 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>测试账号：</div>
          <div>管理员：admin / admin123</div>
          <div>调度员：dispatcher / disp123</div>
        </div>
      </Card>
    </div>
  )
}

export default Login
