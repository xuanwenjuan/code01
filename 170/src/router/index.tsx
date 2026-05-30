import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import AuthRoute from './AuthRoute';
import AppHeader from '../components/business/AppHeader';

const { Content } = Layout;

const Home = lazy(() => import('../pages/Home'));
const ServiceList = lazy(() => import('../pages/ServiceList'));
const ServiceDetail = lazy(() => import('../pages/ServiceDetail'));
const Booking = lazy(() => import('../pages/Booking'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Profile = lazy(() => import('../pages/Profile'));
const Orders = lazy(() => import('../pages/Orders'));
const Address = lazy(() => import('../pages/Address'));
const Favorites = lazy(() => import('../pages/Favorites'));

const loading = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
    <Spin size="large" />
  </div>
);

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Layout>
    <AppHeader />
    <Content style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      {children}
    </Content>
  </Layout>
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Suspense fallback={loading}><Login /></Suspense>,
  },
  {
    path: '/register',
    element: <Suspense fallback={loading}><Register /></Suspense>,
  },
  {
    path: '/',
    element: <MainLayout><Suspense fallback={loading}><Home /></Suspense></MainLayout>,
  },
  {
    path: '/services',
    element: <MainLayout><Suspense fallback={loading}><ServiceList /></Suspense></MainLayout>,
  },
  {
    path: '/service/:id',
    element: <MainLayout><Suspense fallback={loading}><ServiceDetail /></Suspense></MainLayout>,
  },
  {
    path: '/booking/:id',
    element: (
      <AuthRoute requiredRole="user">
        <MainLayout><Suspense fallback={loading}><Booking /></Suspense></MainLayout>
      </AuthRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <AuthRoute>
        <MainLayout><Suspense fallback={loading}><Profile /></Suspense></MainLayout>
      </AuthRoute>
    ),
  },
  {
    path: '/orders',
    element: (
      <AuthRoute>
        <MainLayout><Suspense fallback={loading}><Orders /></Suspense></MainLayout>
      </AuthRoute>
    ),
  },
  {
    path: '/address',
    element: (
      <AuthRoute requiredRole="user">
        <MainLayout><Suspense fallback={loading}><Address /></Suspense></MainLayout>
      </AuthRoute>
    ),
  },
  {
    path: '/favorites',
    element: (
      <AuthRoute requiredRole="user">
        <MainLayout><Suspense fallback={loading}><Favorites /></Suspense></MainLayout>
      </AuthRoute>
    ),
  },
]);

const AppRouter: React.FC = () => <RouterProvider router={router} />;

export default AppRouter;
