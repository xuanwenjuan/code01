import React from 'react';
import { Form, Input, Button, Card, message, Radio } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validatePhone, validatePassword } from '../utils';

interface RegisterFormValues {
  phone: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  role: 'user' | 'technician';
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form] = Form.useForm<RegisterFormValues>();

  const handleSubmit = async (values: RegisterFormValues) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    try {
      const success = register(values.phone, values.password, values.nickname, values.role);
      if (success) {
        message.success('注册成功');
        navigate('/');
      } else {
        message.error('该手机号已注册');
      }
    } catch (error) {
      message.error('注册失败，请重试');
    }
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
          <h1 style={{ margin: '0 0 8px 0', color: '#ff85c0' }}>用户注册</h1>
          <p style={{ color: '#999', margin: 0 }}>加入指爱美甲，享受专业服务</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ role: 'user' }}
        >
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[
              { required: true, message: '请输入昵称' },
              { min: 2, max: 20, message: '昵称长度为2-20个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入昵称"
              size="large"
            />
          </Form.Item>

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

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            rules={[
              { required: true, message: '请确认密码' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="注册身份"
            rules={[{ required: true, message: '请选择注册身份' }]}
          >
            <Radio.Group>
              <Radio value="user">普通用户</Radio>
              <Radio value="technician">美甲师</Radio>
            </Radio.Group>
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
              注册
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: '#999' }}>
          已有账号？<a onClick={() => navigate('/login')}>立即登录</a>
        </div>
      </Card>
    </div>
  );
};

export default Register;
