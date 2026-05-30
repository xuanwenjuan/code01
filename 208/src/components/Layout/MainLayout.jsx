import { Layout } from 'antd';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout className="main-layout">
      <Header />
      <Content className="main-content">
        {children}
      </Content>
      <Footer />
    </Layout>
  );
};

export default MainLayout;
