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
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser } from '../store/slices/userSlice';

const { Title, Text, Link } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.user);
  const [form] = Form.useForm();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(from, { replace: true });
    }
  }, [userInfo, navigate, from]);

  const onFinish = async (values) => {
    try {
      await dispatch(loginUser(values)).unwrap();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-134px)] items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">🧵</div>
          <Title level={2} className="!mb-2">
            欢迎回来
          </Title>
          <Text type="secondary">登录您的账号，继续苏绣学习之旅</Text>
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
          name="login"
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
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
              { max: 20, message: '密码最多20个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<LoginOutlined />}
              className="bg-amber-600 border-amber-600 h-12 text-lg"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary">测试账号</Text>
        </Divider>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>管理员：</span>
            <span className="font-mono">admin / admin123</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>传承人：</span>
            <span className="font-mono">master / master123</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>爱好者：</span>
            <span className="font-mono">user / user123</span>
          </div>
        </div>

        <Divider plain />

        <div className="text-center">
          <Text type="secondary">还没有账号？</Text>{' '}
          <Link onClick={() => navigate('/register')}>立即注册</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
