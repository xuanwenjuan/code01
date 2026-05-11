import { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { DashboardOutlined, BriefcaseOutlined, FileTextOutlined, LineChartOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dashboard } from '@/pages/Dashboard';
import { JobManagement } from '@/pages/JobManagement';
import { ResumeManagement } from '@/pages/ResumeManagement';
import './App.scss';

const { Header, Sider, Content } = Layout;

type MenuKey = 'dashboard' | 'jobs' | 'resumes' | 'stats';

const menuItems: MenuProps['items'] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '数据概览'
  },
  {
    key: 'jobs',
    icon: <BriefcaseOutlined />,
    label: '职位管理'
  },
  {
    key: 'resumes',
    icon: <FileTextOutlined />,
    label: '简历管理'
  },
  {
    key: 'stats',
    icon: <LineChartOutlined />,
    label: '人才库统计'
  }
];

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState<MenuKey>('dashboard');
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setActiveKey(e.key as MenuKey);
  };

  const renderContent = () => {
    switch (activeKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'jobs':
        return <JobManagement />;
      case 'resumes':
        return <ResumeManagement />;
      case 'stats':
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div className="logo">
          {collapsed ? 'HR' : '智能招聘系统'}
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
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="header-content">
            <div>
              {collapsed ? (
                <MenuUnfoldOutlined className="trigger" onClick={() => setCollapsed(false)} />
              ) : (
                <MenuFoldOutlined className="trigger" onClick={() => setCollapsed(true)} />
              )}
              <span className="header-title">企业智能招聘与人才库管理系统</span>
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto'
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
