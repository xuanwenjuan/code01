import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Books from '@/pages/Books';
import BookDetail from '@/pages/BookDetail';
import Profile from '@/pages/Profile';
import ErrorBoundary from '@/components/ErrorBoundary';

const AuthRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.user);
  const location = useLocation();

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
};

const RedirectIfAuthenticated = ({ children }) => {
  const { userInfo } = useSelector((state) => state.user);

  if (userInfo) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/home"
            element={
              <AuthRoute>
                <Home />
              </AuthRoute>
            }
          />
          <Route
            path="/books"
            element={
              <AuthRoute>
                <Books />
              </AuthRoute>
            }
          />
          <Route
            path="/book/:id"
            element={
              <AuthRoute>
                <BookDetail />
              </AuthRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthRoute>
                <Profile />
              </AuthRoute>
            }
          />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default AppRoutes;
