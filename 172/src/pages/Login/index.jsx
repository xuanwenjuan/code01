import { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, isAdmin } = useAuth();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isLoggedIn) {
      const from = location.state?.from?.pathname || (isAdmin ? '/admin' : '/');
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, navigate, location, isAdmin]);

  const onFinish = (values) => {
    const result = login(values.username, values.password);
    if (result?.success) {
      message.success('登录成功');
      const from = location.state?.from?.pathname || (result.user.role === 'admin' ? '/admin' : '/');
      navigate(from, { replace: true });
    } else {
      message.error(result?.message || '登录失败');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 134px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card style={{ width: 400, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={3} style={{ margin: 0 }}>
          🎁 文具礼品商城
        </Title>
        <p style={{ color: '#666', marginTop: 8 }}>欢迎回来，请登录您的账号</p>
      </div>

      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        initialValues={{
          username: 'user',
          password: '123456',
        }}
        size="large"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block style={{ height: 48, fontSize: 16 }}>
            登录
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
        <p style={{ margin: 0 }}>测试账号：</p>
        <p style={{ margin: '4px 0' }}>普通用户：user / 123456</p>
        <p style={{ margin: 0 }}>管理员：admin / 123456</p>
      </div>
    </Card>
    </div>
  );
};

export default Login;
