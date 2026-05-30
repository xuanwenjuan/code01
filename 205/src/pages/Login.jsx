import { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '@/store/authSlice';
import { logOperation } from '@/store/platformSlice';
import { validateUsername, validatePassword } from '@/utils/validation';
import Loading from '@/components/Loading';
import './Login.css';

const { Title, Paragraph } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);
  const [form] = Form.useForm();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      dispatch(logOperation({
        action: 'login',
        detail: `用户登录: ${user.username}`,
      }));
      message.success(`欢迎回来，${user.name}！`);
      navigate(from, { replace: true });
    }
    return () => {
      dispatch(clearError());
    };
  }, [user, navigate, from, dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleSubmit = values => {
    dispatch(login(values));
  };

  if (loading) {
    return <Loading text="登录中..." />;
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <span className="brand-icon">🏺</span>
          <Title level={1} className="brand-title">
            花丝镶嵌
          </Title>
          <Paragraph className="brand-subtitle">
            传统花丝镶嵌技艺数字化展示平台
          </Paragraph>
        </div>
      </div>
      <div className="login-right">
        <Card className="login-card">
          <Title level={3} className="login-title">
            欢迎登录
          </Title>
          <Paragraph className="login-subtitle">
            登录后可收藏作品、查看浏览记录
          </Paragraph>

          {error && (
            <Alert
              message="登录失败"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => dispatch(clearError())}
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[{ validator: validateUsername }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ validator: validatePassword }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="login-btn"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="demo-accounts">
            <Paragraph type="secondary" style={{ marginBottom: 8 }}>
              演示账号：
            </Paragraph>
            <div className="account-item">
              <span>管理员：</span>
              <code>admin / admin123</code>
            </div>
            <div className="account-item">
              <span>研究员：</span>
              <code>researcher / user123</code>
            </div>
            <div className="account-item">
              <span>收藏家：</span>
              <code>collector / user123</code>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
