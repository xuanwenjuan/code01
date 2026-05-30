import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import { HomeOutlined, BookOutlined, TeamOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import './Layout.css';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.auth);

  const mainMenuItems = [
    { key: '/', icon: <HomeOutlined />, label: '平台首页' },
    { key: '/skill', icon: <BookOutlined />, label: '技艺解析' },
    { key: '/community', icon: <TeamOutlined />, label: '交流分享' },
  ];

  const userMenuItems = [
    ...(currentUser?.role === 'admin' ? [
      { key: '/admin', icon: <SettingOutlined />, label: '管理后台', onClick: () => navigate('/admin') }
    ] : []),
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: () => handleLogout() },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AntHeader className="site-header">
      <div className="logo" onClick={() => navigate('/')}>
        <span className="logo-icon">✂️</span>
        <span className="logo-text">剪纸技艺平台</span>
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={mainMenuItems}
        onClick={handleMenuClick}
        className="main-menu"
      />
      <div className="user-section">
        {currentUser ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="user-info">
              <Avatar src={currentUser.avatar} icon={<UserOutlined />} />
              <span className="username">{currentUser.nickname}</span>
            </div>
          </Dropdown>
        ) : (
          <Button type="primary" onClick={() => navigate('/login')}>
            登录
          </Button>
        )}
      </div>
    </AntHeader>
  );
};

export default Header;
