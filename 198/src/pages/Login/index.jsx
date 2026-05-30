import React, { useEffect } from 'react';
import { Form, Input, Button, Card, message, Radio } from 'antd';
import { UserOutlined, LockOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/store/slices/userSlice';
import Loading from '@/components/Loading';
import { USER_ROLES } from '@/types';
import './index.css';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  
  const { userInfo, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (userInfo) {
      navigate('/home');
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleSubmit = async (values) => {
    const resultAction = await dispatch(login(values));
    if (login.fulfilled.match(resultAction)) {
      message.success('登录成功');
      navigate('/home');
    }
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    if (role === USER_ROLES.ADMIN) {
      form.setFieldsValue({ username: 'admin', password: 'admin123' });
    } else {
      form.setFieldsValue({ username: 'restorer', password: 'restorer123' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-overlay"></div>
      </div>
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <div className="login-logo">
            <BookOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </div>
          <h1 className="login-title">古籍修复数字化档案管理平台</h1>
          <p className="login-subtitle">保护文化遗产，传承华夏文明</p>
        </div>
        
        <Form
          form={form}
          name="login"
          initialValues={{ 
            username: 'admin', 
            password: 'admin123',
            role: USER_ROLES.ADMIN
          }}
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            name="role"
            label="选择角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Radio.Group onChange={handleRoleChange} className="role-selector">
              <Radio.Button value={USER_ROLES.ADMIN}>档案管理员</Radio.Button>
              <Radio.Button value={USER_ROLES.RESTORER}>古籍修复师</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度在3到20个字符之间' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度在6到20个字符之间' },
              { pattern: /^[a-zA-Z0-9_!@#$%^&*]+$/, message: '密码包含非法字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              className="login-btn"
            >
              {loading ? '登录中...' : '登 录'}
            </Button>
          </Form.Item>
        </Form>

        <div className="login-tips">
          <p>测试账号：</p>
          <p>管理员：admin / admin123</p>
          <p>修复师：restorer / restorer123</p>
        </div>
      </Card>
      
      {loading && <Loading fullscreen text="登录中..." />}
    </div>
  );
};

export default Login;
