import React from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Space, Tag } from 'antd';
import { 
  HomeOutlined, 
  BookOutlined, 
  UserOutlined, 
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HeartOutlined,
  HistoryOutlined,
  ToolOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/userSlice';
import { toggleCollapsed } from '@/store/slices/globalSlice';
import { USER_ROLES } from '@/types';
import UpdateNotification from '@/components/UpdateNotification';
import './index.css';

const { Header, Sider, Content } = AntLayout;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { userInfo } = useSelector((state) => state.user);
  const { collapsed } = useSelector((state) => state.global);

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getMenuItems = () => {
    const baseItems = [
      {
        key: '/home',
        icon: <HomeOutlined />,
        label: '档案首页'
      },
      {
        key: '/books',
        icon: <BookOutlined />,
        label: '古籍档案'
      },
      {
        key: '/profile',
        icon: <UserOutlined />,
        label: '个人中心'
      }
    ];

    if (userInfo?.role === USER_ROLES.ADMIN) {
      baseItems.splice(2, 0, {
        key: '/admin',
        icon: <ToolOutlined />,
        label: '管理后台'
      });
    }

    if (userInfo?.role === USER_ROLES.RESTORER) {
      baseItems.splice(2, 0, {
        key: '/my-tasks',
        icon: <FileTextOutlined />,
        label: '我的任务'
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const userMenuItems = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人信息'
    },
    {
      key: '/profile?tab=favorites',
      icon: <HeartOutlined />,
      label: '我的收藏'
    },
    {
      key: '/profile?tab=history',
      icon: <HistoryOutlined />,
      label: '浏览记录'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  const getRoleLabel = (role) => {
    if (role === USER_ROLES.ADMIN) return '档案管理员';
    if (role === USER_ROLES.RESTORER) return '古籍修复师';
    return '未知角色';
  };

  return (
    <AntLayout className="main-layout">
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div className="logo">
          <div className="logo-icon">
            <BookOutlined />
          </div>
          {!collapsed && <span className="logo-text">古籍修复</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="side-menu"
        />
      </Sider>
      <AntLayout>
        <Header className="header">
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => dispatch(toggleCollapsed())}
              className="collapse-btn"
            />
            <span className="page-title">
              {menuItems.find((item) => item.key === location.pathname)?.label || '古籍修复数字化档案管理平台'}
            </span>
          </Space>
          <div className="header-right">
            <UpdateNotification />
            <span className="role-badge">
              {getRoleLabel(userInfo?.role)}
            </span>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-info">
                <Avatar src={userInfo?.avatar} icon={<UserOutlined />} />
                <span className="user-name">{userInfo?.name || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="main-content">
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
