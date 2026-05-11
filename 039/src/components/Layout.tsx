import React, { useState, useMemo } from 'react';
import { Layout, Menu, theme, Button, Avatar, Dropdown, Space, Badge } from 'antd';
import type { MenuProps, LayoutProps } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  HistoryOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import type { Order } from '@/types';
import CustomerManagement from '@/pages/CustomerManagement';
import OrderManagement from '@/pages/OrderManagement';
import OperationLogPage from '@/pages/OperationLog';
import { useAppStore } from '@/store';

const { Header, Sider, Content } = Layout;

type PageKey = 'customers' | 'orders' | 'logs';

interface UserMenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  type?: 'divider';
}

const pageComponents: Record<PageKey, React.FC> = {
  customers: CustomerManagement,
  orders: OrderManagement,
  logs: OperationLogPage
};

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<PageKey>('customers');
  const { orders } = useAppStore();
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();

  const unprocessedLargeOrders: number = useMemo(() => {
    return orders.filter((o: Order) => o.isLargeAmount && !o.processed).length;
  }, [orders]);

  const handleToggleCollapsed = (): void => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setActiveKey(key as PageKey);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: '客户与档案管理'
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: unprocessedLargeOrders > 0 ? (
        <Badge count={unprocessedLargeOrders} size="small" offset={[5, 0]}>
          <span>订单与业绩管理</span>
        </Badge>
      ) : (
        '订单与业绩管理'
      )
    },
    {
      key: 'logs',
      icon: <HistoryOutlined />,
      label: '操作履历与审计'
    }
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录'
    }
  ];

  const ActiveComponent: React.FC = pageComponents[activeKey];
  const siderStyle: React.CSSProperties = { minHeight: '100vh' };
  const headerStyle: React.CSSProperties = {
    padding: '0 24px',
    background: colorBgContainer,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };
  const contentStyle: React.CSSProperties = {
    margin: '0',
    minHeight: 280,
    background: colorBgContainer,
    borderRadius: borderRadiusLG,
    overflow: 'auto'
  };
  const logoContainerStyle: React.CSSProperties = {
    height: 64,
    margin: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: collapsed ? 14 : 18,
    fontWeight: 'bold'
  };
  const toggleButtonStyle: React.CSSProperties = { fontSize: '16px', width: 64, height: 64 };

  return (
    <Layout style={siderStyle}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={240}>
        <div style={logoContainerStyle}>
          {collapsed ? (
            <DashboardOutlined style={{ fontSize: 24 }} />
          ) : (
            <span>企业智能管理系统</span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={headerStyle}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={handleToggleCollapsed}
            style={toggleButtonStyle}
          />
          <Space size={16}>
            <Badge count={unprocessedLargeOrders} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ display: collapsed ? 'none' : 'inline' }}>管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={contentStyle}>
          <ActiveComponent />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
