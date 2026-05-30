import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge, Button, Modal } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  EnvironmentOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppSelector, useAppDispatch } from '../../store';
import { setCurrentCity } from '../../store/modules/app';

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout, isTechnician } = useAuth();
  const { currentCity, cities } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleCityChange = (city: string) => {
    dispatch(setCurrentCity(city));
  };

  const userMenuItems = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: '我的订单',
      onClick: () => navigate('/orders'),
    },
    ...(isTechnician ? [] : [
      {
        key: '/favorites',
        icon: <HeartOutlined />,
        label: '我的收藏',
        onClick: () => navigate('/favorites'),
      },
      {
        key: '/address',
        icon: <EnvironmentOutlined />,
        label: '地址管理',
        onClick: () => navigate('/address'),
      },
    ]),
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        Modal.confirm({
          title: '确认退出',
          content: '您确定要退出登录吗？',
          onOk: () => {
            logout();
            navigate('/');
          },
        });
      },
    },
  ];

  const cityMenuItems = cities.map((city) => ({
    key: city,
    label: city,
    onClick: () => handleCityChange(city),
  }));

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/services',
      icon: <AppstoreOutlined />,
      label: '服务列表',
    },
  ];

  return (
    <Header
      style={{
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ff85c0',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          💅 指爱美甲
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          style={{ borderBottom: 'none', minWidth: '200px' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Dropdown menu={{ items: cityMenuItems }}>
          <Button type="text" icon={<EnvironmentOutlined />}>
            {currentCity}
          </Button>
        </Dropdown>

        {isLoggedIn ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar src={user?.avatar} icon={<UserOutlined />} />
              <span style={{ marginLeft: '8px' }}>{user?.nickname}</span>
            </div>
          </Dropdown>
        ) : (
          <div>
            <Button type="text" onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              注册
            </Button>
          </div>
        )}
      </div>
    </Header>
  );
};

export default AppHeader;
