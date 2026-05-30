import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Checkbox } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons'
import { login } from '@/store/userSlice'
import { useFormValidation, validators } from '@/hooks'
import './index.scss'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit
  } = useFormValidation(
    { username: '', phone: '', code: '', password: '', confirmPassword: '', agree: false },
    {
      username: validators.required('请输入用户名'),
      phone: validators.phone('请输入正确的手机号'),
      code: validators.required('请输入验证码'),
      password: validators.password('密码至少6位，包含字母和数字'),
      confirmPassword: (value, allValues) => {
        if (!value) return '请确认密码'
        if (value !== allValues.password) return '两次密码输入不一致'
        return null
      }
    }
  )

  const handleRegister = async () => {
    if (!values.agree) {
      message.warning('请同意用户协议')
      return
    }

    const isValid = await handleSubmit(async (formValues) => {
      setLoading(true)
      setTimeout(() => {
        dispatch(login({
          username: formValues.username,
          phone: formValues.phone,
          nickname: formValues.username,
          role: 'consumer'
        }))
        setLoading(false)
        message.success('注册成功')
        navigate('/')
      }, 1000)
    })
  }

  const handleSendCode = () => {
    if (!values.phone || values.phone.length !== 11) {
      message.warning('请输入正确的手机号')
      return
    }
    message.success('验证码已发送：123456')
  }

  return (
    <div className="register-page">
      <div className="register-header">
        <Link to="/" className="logo">
          <span className="logo-icon">🥬</span>
          <span className="logo-text">鲜到家</span>
        </Link>
      </div>

      <Card className="register-card">
        <h2 className="register-title">注册新账号</h2>

        <Form form={form} layout="vertical" onFinish={handleRegister}>
          <Form.Item
            label="用户名"
            validateStatus={errors.username ? 'error' : ''}
            help={errors.username}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              size="large"
              value={values.username}
              onChange={(e) => handleChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
            />
          </Form.Item>

          <Form.Item
            label="手机号"
            validateStatus={errors.phone ? 'error' : ''}
            help={errors.phone}
          >
            <Input
              prefix={<MobileOutlined />}
              placeholder="请输入手机号"
              size="large"
              value={values.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
            />
          </Form.Item>

          <Form.Item
            label="验证码"
            validateStatus={errors.code ? 'error' : ''}
            help={errors.code}
          >
            <div className="code-input">
              <Input
                placeholder="请输入验证码"
                size="large"
                value={values.code}
                onChange={(e) => handleChange('code', e.target.value)}
                onBlur={() => handleBlur('code')}
              />
              <Button
                size="large"
                onClick={handleSendCode}
                disabled={!values.phone || values.phone.length !== 11}
              >
                获取验证码
              </Button>
            </div>
          </Form.Item>

          <Form.Item
            label="设置密码"
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码（至少6位，包含字母和数字）"
              size="large"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
            />
          </Form.Item>

          <Form.Item
            label="确认密码"
            validateStatus={errors.confirmPassword ? 'error' : ''}
            help={errors.confirmPassword}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              size="large"
              value={values.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
            />
          </Form.Item>

          <Form.Item>
            <Checkbox
              checked={values.agree}
              onChange={(e) => handleChange('agree', e.target.checked)}
            >
              我已阅读并同意 <a href="#">《用户协议》</a> 和 <a href="#">《隐私政策》</a>
            </Checkbox>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            注册
          </Button>
        </Form>

        <div className="register-footer">
          已有账号？<Link to="/login">立即登录</Link>
        </div>
      </Card>
    </div>
  )
}

export default Register
