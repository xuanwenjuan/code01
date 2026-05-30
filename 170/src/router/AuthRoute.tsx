import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AuthRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'technician';
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, requiredRole }) => {
  const { isLoggedIn, isTechnician, isUser } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'technician' && !isTechnician) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'user' && !isUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;
