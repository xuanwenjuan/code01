import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Divider,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { registerUser } from '../store/slices/userSlice';

const { Title, Text, Link } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.user);
  const [form] = Form.useForm();

  useEffect(() => {
    if (userInfo) {
      navigate('/', { replace: true });
    }
  }, [userInfo, navigate]);

  const onFinish = async (values) => {
    try {
      await dispatch(registerUser(values)).unwrap();
    } catch (err) {
      console.error('Register failed:', err);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-134px)] items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">🧵</div>
          <Title level={2} className="!mb-2">
            加入我们
          </Title>
          <Text type="secondary">创建账号，开启您的苏绣学习之旅</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-6"
            closable
          />
        )}

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: '用户名只能包含字母、数字和下划线',
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="nickname"
            rules={[
              { required: true, message: '请输入昵称' },
              { min: 2, message: '昵称至少2个字符' },
              { max: 20, message: '昵称最多20个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="昵称" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              {
                pattern: /^1[3-9]\d{9}$/,
                message: '请输入有效的手机号',
              },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="手机号" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
              { max: 20, message: '密码最多20个字符' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
                message: '密码需包含大小写字母和数字',
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<UserAddOutlined />}
              className="bg-amber-600 border-amber-600 h-12 text-lg"
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider plain />

        <div className="text-center">
          <Text type="secondary">已有账号？</Text>{' '}
          <Link onClick={() => navigate('/login')}>立即登录</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
