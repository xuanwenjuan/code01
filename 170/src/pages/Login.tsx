import React from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validatePhone, validatePassword } from '../utils';

interface LoginFormValues {
  phone: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form] = Form.useForm<LoginFormValues>();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const success = login(values.phone, values.password);
      if (success) {
        message.success('登录成功');
        navigate(from, { replace: true });
      } else {
        message.error('手机号或密码错误');
      }
    } catch (error) {
      message.error('登录失败，请重试');
    }
  };

  const handleQuickLogin = (phone: string, password: string) => {
    form.setFieldsValue({ phone, password });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)',
      }}
    >
      <Card
        style={{
          width: '420px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>💅</div>
          <h1 style={{ margin: '0 0 8px 0', color: '#ff85c0' }}>指爱美甲</h1>
          <p style={{ color: '#999', margin: 0 }}>专业上门美甲美睫服务平台</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ phone: '13800138000', password: '123456' }}
        >
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (validatePhone(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('请输入正确的手机号'));
                },
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="请输入手机号"
              size="large"
              maxLength={11}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (validatePassword(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('密码长度为6-20位'));
                },
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{
                background: 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)',
                border: 'none',
                height: '48px',
                fontSize: '16px',
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: '#999', marginBottom: '16px' }}>
          还没有账号？<a onClick={() => navigate('/register')}>立即注册</a>
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
          <p style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>快速登录体验：</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              size="small"
              onClick={() => handleQuickLogin('13800138000', '123456')}
            >
              普通用户
            </Button>
            <Button
              size="small"
              onClick={() => handleQuickLogin('13900139000', '123456')}
            >
              美甲师
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
