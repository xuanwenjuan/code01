import { Form, Input, Button, Card, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { useEffect } from 'react';
import Loading from '../../components/Status/Loading';
import './Auth.css';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, currentUser } = useSelector(state => state.auth);
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
    return () => dispatch(clearError());
  }, [currentUser, navigate, dispatch]);

  const handleSubmit = async (values) => {
    const result = await dispatch(login(values));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  if (loading) {
    return <Loading tip="登录中..." />;
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✂️</div>
          <Title level={3}>剪纸技艺平台</Title>
          <Text type="secondary">欢迎回来，请登录您的账号</Text>
        </div>

        {error && (
          <Alert
            message="登录失败"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => dispatch(clearError())}
            style={{ marginBottom: 20 }}
          />
        )}

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度为3-20个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度为6-20个字符' },
              { pattern: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, message: '密码包含非法字符' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary">测试账号</Text>
        </Divider>

        <div className="test-accounts">
          <Text type="secondary">管理员：admin / admin123</Text>
          <Text type="secondary">普通用户：user1 / user123</Text>
          <Text type="secondary">传承人：master1 / master123</Text>
        </div>

        <div className="auth-footer">
          <Text type="secondary">还没有账号？</Text>
          <Link to="/register">立即注册</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
