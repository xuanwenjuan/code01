import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from '../components/Layout/MainLayout';
import Home from '../pages/Home';
import Skill from '../pages/Skill';
import Community from '../pages/Community';
import Admin from '../pages/Admin';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Error from '../components/Status/Error';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser } = useSelector(state => state.auth);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <Admin />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={
        <MainLayout>
          <Home />
        </MainLayout>
      } />
      
      <Route path="/skill" element={
        <MainLayout>
          <Skill />
        </MainLayout>
      } />
      
      <Route path="/community" element={
        <MainLayout>
          <Community />
        </MainLayout>
      } />
      
      <Route path="/404" element={
        <MainLayout>
          <Error status="404" title="404" subTitle="抱歉，您访问的页面不存在" />
        </MainLayout>
      } />
      
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRouter;
