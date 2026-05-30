import { Layout as AntLayout, Menu, Dropdown, Avatar, Space, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  HomeOutlined,
  AppstoreOutlined,
  BookOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { logout } from '../store/slices/userSlice';

const { Header, Content, Footer } = AntLayout;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/appreciation',
      icon: <AppstoreOutlined />,
      label: '绣品鉴赏',
      onClick: () => navigate('/appreciation'),
    },
    {
      key: '/learning',
      icon: <BookOutlined />,
      label: '学习中心',
      onClick: () => navigate('/learning'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'learning-center',
      icon: <BookOutlined />,
      label: '我的学习',
      onClick: () => navigate('/learning-center'),
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        dispatch(logout());
        navigate('/');
      },
    },
  ];

  if (userInfo?.role === 'admin') {
    userMenuItems.unshift({
      key: 'admin',
      icon: <DashboardOutlined />,
      label: '管理后台',
      onClick: () => navigate('/admin'),
    });
  }

  const handleMenuClick = (e) => {
    if (e.key === 'login') {
      navigate('/login');
    } else if (e.key === 'register') {
      navigate('/register');
    }
  };

  return (
    <AntLayout className="min-h-screen">
      <Header className="flex items-center justify-between px-8 bg-gradient-to-r from-amber-800 to-amber-900">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-amber-100 cursor-pointer" onClick={() => navigate('/')}>
            苏绣传承
          </div>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="flex-1 justify-center"
          style={{ background: 'transparent', borderBottom: 'none' }}
        />
        <div className="flex items-center">
          {userInfo ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="cursor-pointer text-amber-100 hover:text-white">
                <Avatar src={userInfo.avatar} size="small" />
                <span>{userInfo.nickname}</span>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Button type="text" className="text-amber-100" onClick={() => navigate('/login')}>
                登录
              </Button>
              <Button type="primary" className="bg-amber-600 border-amber-600" onClick={() => navigate('/register')}>
                注册
              </Button>
            </Space>
          )}
        </div>
      </Header>
      <Content className="min-h-[calc(100vh-64px-70px)]">
        <Outlet />
      </Content>
      <Footer className="text-center bg-amber-50 py-5">
        <div className="text-gray-600">
          传统苏绣技艺数字化传承平台 © {new Date().getFullYear()} Created with ❤️ for cultural heritage
        </div>
      </Footer>
    </AntLayout>
  );
};

export default Layout;
