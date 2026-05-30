import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Home from '../pages/Home';
import ProductDetail from '../pages/ProductDetail';
import Category from '../pages/Category';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import Orders from '../pages/Orders';
import Admin from '../pages/Admin';
import Profile from '../pages/Profile';

const { Content } = Layout;

const RequireAuth = ({ children, role }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RequireUser = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const MainLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ background: '#f5f5f5' }}>
        {children}
      </Content>
      <Footer />
    </Layout>
  );
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <MainLayout>
            <Home />
          </MainLayout>
        } />
        
        <Route path="/product/:id" element={
          <MainLayout>
            <ProductDetail />
          </MainLayout>
        } />
        
        <Route path="/category" element={
          <MainLayout>
            <Category />
          </MainLayout>
        } />
        
        <Route path="/category/:id" element={
          <MainLayout>
            <Category />
          </MainLayout>
        } />
        
        <Route path="/cart" element={
          <MainLayout>
            <Cart />
          </MainLayout>
        } />
        
        <Route path="/orders" element={
          <RequireUser>
            <MainLayout>
              <Orders />
            </MainLayout>
          </RequireUser>
        } />
        
        <Route path="/profile" element={
          <RequireUser>
            <MainLayout>
              <Profile />
            </MainLayout>
          </RequireUser>
        } />
        
        <Route path="/admin" element={
          <RequireAuth role="admin">
            <MainLayout>
              <Admin />
            </MainLayout>
          </RequireAuth>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
