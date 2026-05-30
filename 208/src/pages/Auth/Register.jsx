import { Form, Input, Button, Card, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import { useEffect } from 'react';
import Loading from '../../components/Status/Loading';
import './Auth.css';

const { Title, Text } = Typography;

const Register = () => {
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
    const { confirmPassword, ...rest } = values;
    const result = await dispatch(register(rest));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  if (loading) {
    return <Loading tip="注册中..." />;
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✂️</div>
          <Title level={3}>注册新账号</Title>
          <Text type="secondary">加入剪纸技艺平台，传承中华传统文化</Text>
        </div>

        {error && (
          <Alert
            message="注册失败"
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
            name="nickname"
            label="昵称"
            rules={[
              { required: true, message: '请输入昵称' },
              { min: 2, max: 20, message: '昵称长度为2-20个字符' }
            ]}
          >
            <Input prefix={<UserAddOutlined />} placeholder="请输入昵称" />
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

          <Form.Item
            name="confirmPassword"
            label="确认密码"
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
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div className="auth-footer">
          <Text type="secondary">已有账号？</Text>
          <Link to="/login">立即登录</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
