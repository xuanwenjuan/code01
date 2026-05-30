import { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Modal, List, Tag, Button } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  HeartOutlined,
  HistoryOutlined,
  LogoutOutlined,
  CrownOutlined,
  BellOutlined,
  GiftOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/authSlice';
import {
  fetchNotifications,
  markNotificationRead,
  showNotificationModal,
  hideNotificationModal,
  logOperation,
} from '@/store/platformSlice';
import GlobalSearch from './GlobalSearch';
import './Layout.css';

const { Header, Content, Footer } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { favorites } = useSelector(state => state.user);
  const { notifications, notificationModalVisible } = useSelector(state => state.platform);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      const hasSeenModal = sessionStorage.getItem('hasSeenNotificationModal');
      if (!hasSeenModal) {
        setTimeout(() => {
          dispatch(showNotificationModal());
          sessionStorage.setItem('hasSeenNotificationModal', 'true');
        }, 1000);
      }
    }
  }, [dispatch, user]);

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    dispatch(logOperation({
      action: 'logout',
      detail: '用户退出登录',
    }));
    dispatch(logout());
    navigate('/login');
  };

  const handleNotificationClick = notification => {
    dispatch(markNotificationRead(notification.id));
    dispatch(logOperation({
      action: 'view_notification',
      detail: `查看通知: ${notification.title}`,
    }));
  };

  const handleViewAllNotifications = () => {
    dispatch(hideNotificationModal());
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/profile');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: '我的收藏',
      onClick: () => navigate('/favorites'),
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: '浏览记录',
      onClick: () => navigate('/history'),
    },
    user?.role === 'admin' && {
      key: 'admin',
      icon: <CrownOutlined />,
      label: '管理后台',
      onClick: () => navigate('/admin'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ].filter(Boolean);

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
  ];

  const selectedKey = location.pathname === '/' ? '/' : '/' + location.pathname.split('/')[1];

  const getNotificationIcon = type => {
    switch (type) {
      case 'new_work':
        return <GiftOutlined style={{ color: '#d4af37' }} />;
      case 'case_update':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      default:
        return <BellOutlined />;
    }
  };

  const getNotificationTag = type => {
    switch (type) {
      case 'new_work':
        return <Tag color="gold">新品</Tag>;
      case 'case_update':
        return <Tag color="green">更新</Tag>;
      default:
        return <Tag>通知</Tag>;
    }
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">🏺</span>
            <span className="logo-text">花丝镶嵌</span>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuClick}
            className="header-menu"
          />
          <div className="header-search">
            <GlobalSearch />
          </div>
          <div className="header-right">
            {user && (
              <div
                className="notification-icon"
                onClick={() => dispatch(showNotificationModal())}
              >
                <Badge count={unreadCount} size="small">
                  <BellOutlined style={{ fontSize: '20px', color: '#fff' }} />
                </Badge>
              </div>
            )}
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="user-info">
                  <Badge count={favorites.length} size="small" offset={[-2, 2]}>
                    <Avatar src={user.avatar} icon={<UserOutlined />} />
                  </Badge>
                  <span className="user-name">{user.name}</span>
                  {user.role === 'admin' && (
                    <Tag color="gold" className="admin-tag">管理员</Tag>
                  )}
                </div>
              </Dropdown>
            ) : (
              <span className="login-link" onClick={() => navigate('/login')}>
                登录 / 注册
              </span>
            )}
          </div>
        </div>
      </Header>
      <Content className="app-content">
        <Outlet />
      </Content>
      <Footer className="app-footer">
        <div className="footer-content">
          <p>传统花丝镶嵌技艺数字化展示平台 © 2024</p>
          <p className="footer-sub">传承匠心 · 弘扬国粹</p>
        </div>
      </Footer>

      <Modal
        title={
          <div className="modal-title">
            <BellOutlined style={{ color: '#d4af37', marginRight: 8 }} />
            消息通知
          </div>
        }
        open={notificationModalVisible}
        onCancel={() => dispatch(hideNotificationModal())}
        footer={[
          <Button key="viewAll" type="primary" onClick={handleViewAllNotifications}>
            查看全部
          </Button>,
          <Button key="close" onClick={() => dispatch(hideNotificationModal())}>
            关闭
          </Button>,
        ]}
        width={500}
      >
        <List
          dataSource={notifications.slice(0, 5)}
          renderItem={item => (
            <List.Item
              className={!item.read ? 'unread-notification' : ''}
              onClick={() => handleNotificationClick(item)}
            >
              <List.Item.Meta
                avatar={getNotificationIcon(item.type)}
                title={
                  <div className="notification-title">
                    {getNotificationTag(item.type)}
                    <span>{item.title}</span>
                  </div>
                }
                description={
                  <div className="notification-content">
                    <p>{item.content}</p>
                    <span className="notification-time">{item.time}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </Layout>
  );
};

export default AppLayout;
