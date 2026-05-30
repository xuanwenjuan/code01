import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Appreciation from '../pages/Appreciation';
import EmbroideryDetail from '../pages/EmbroideryDetail';
import Learning from '../pages/Learning';
import TutorialDetail from '../pages/TutorialDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import LearningCenter from '../pages/LearningCenter';
import AdminDashboard from '../pages/AdminDashboard';
import ProtectedRoute from '../components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'appreciation',
        element: <Appreciation />,
      },
      {
        path: 'embroidery/:id',
        element: <EmbroideryDetail />,
      },
      {
        path: 'learning',
        element: <Learning />,
      },
      {
        path: 'tutorial/:id',
        element: <TutorialDetail />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'learning-center',
        element: (
          <ProtectedRoute>
            <LearningCenter />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
