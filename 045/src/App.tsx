import { useState, lazy, Suspense } from 'react';
import { Layout, Menu, theme, Typography, Spin } from 'antd';
import {
  ProjectOutlined,
  UserOutlined,
  CalendarOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useAppStore } from '@/store';
import '@/styles/global.scss';
import './App.scss';

const ProjectsPage = lazy(() => import('@/pages/Projects'));
const CustomersPage = lazy(() => import('@/pages/Customers'));
const AppointmentsPage = lazy(() => import('@/pages/Appointments'));
const OrdersPage = lazy(() => import('@/pages/Orders'));

const PageLoader = () => (
  <div className="loading-container">
    <Spin size="large" tip="加载中..." />
  </div>
);

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  {
    key: 'projects',
    icon: <ProjectOutlined />,
    label: '科室项目管理'
  },
  {
    key: 'customers',
    icon: <UserOutlined />,
    label: '客户健康档案'
  },
  {
    key: 'appointments',
    icon: <CalendarOutlined />,
    label: '预约排班管理'
  },
  {
    key: 'orders',
    icon: <ShoppingOutlined />,
    label: '消费套餐订单'
  }
];

const App = () => {
  const { currentModule, setCurrentModule } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();

  const renderModule = () => {
    const ModuleComponent = (() => {
      switch (currentModule) {
        case 'projects':
          return ProjectsPage;
        case 'customers':
          return CustomersPage;
        case 'appointments':
          return AppointmentsPage;
        case 'orders':
          return OrdersPage;
        default:
          return ProjectsPage;
      }
    })();

    return (
      <Suspense fallback={<PageLoader />}>
        <ModuleComponent />
      </Suspense>
    );
  };

  return (
    <Layout className="app-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth="0"
        theme="light"
        className="app-sider"
      >
        <div className="sider-header">
          <ProjectOutlined className="logo-icon" />
          {!collapsed && <Title level={4} className="logo-text">医美管理系统</Title>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentModule]}
          items={menuItems}
          onClick={({ key }) => setCurrentModule(key)}
          className="main-menu"
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} className="app-header">
          <div className="header-content">
            <Title level={3} className="page-title">
              {menuItems.find(item => item.key === currentModule)?.label || '医美管理系统'}
            </Title>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 'calc(100vh - 112px)',
            background: colorBgContainer,
            borderRadius: borderRadiusLG
          }}
        >
          {renderModule()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
