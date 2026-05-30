import { Layout, Menu, Badge, Avatar, Dropdown, Button } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, currentUser, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人中心',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'orders',
      label: '我的订单',
      onClick: () => navigate('/orders'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return ['admin'];
    if (path.startsWith('/cart')) return ['cart'];
    if (path.startsWith('/category')) return ['category'];
    return ['home'];
  };

  const menuItems = [
    {
      key: 'home',
      label: <Link to="/">首页</Link>,
    },
    {
      key: 'category',
      label: <Link to="/category">商品分类</Link>,
    },
    {
      key: 'cart',
      label: (
        <Link to="/cart">
          <Badge count={cartCount} size="small" offset={[5, -2]}>
            购物车
          </Badge>
        </Link>
      ),
    },
    isAdmin && {
      key: 'admin',
      label: <Link to="/admin">商家后台</Link>,
    },
  ].filter(Boolean);

  return (
    <AntHeader style={{ background: '#fff', padding: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
          🎁 文具礼品商城
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Menu
            mode="horizontal"
            selectedKeys={getSelectedKeys()}
            items={menuItems}
            style={{ minWidth: 400, border: 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isLoggedIn ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <Avatar size="small" src={currentUser?.avatar} icon={<UserOutlined />} />
                  <span>{currentUser?.name}</span>
                </div>
              </Dropdown>
            ) : (
              <Button type="primary" onClick={() => navigate('/login')}>
                登录
              </Button>
            )}
          </div>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
