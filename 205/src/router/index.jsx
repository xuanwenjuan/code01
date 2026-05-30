import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import WorkDetail from '@/pages/WorkDetail';
import TechniqueDetail from '@/pages/TechniqueDetail';
import CaseDetail from '@/pages/CaseDetail';
import Login from '@/pages/Login';
import Profile from '@/pages/Profile';
import Favorites from '@/pages/Favorites';
import History from '@/pages/History';
import Admin from '@/pages/Admin';
import SearchResults from '@/pages/SearchResults';
import NotFound from '@/pages/NotFound';
import Forbidden from '@/pages/Forbidden';
import ProtectedRoute from './ProtectedRoute';

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
        path: 'work/:id',
        element: <WorkDetail />,
      },
      {
        path: 'technique/:id',
        element: <TechniqueDetail />,
      },
      {
        path: 'case/:id',
        element: <CaseDetail />,
      },
      {
        path: 'search',
        element: <SearchResults />,
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
        path: 'favorites',
        element: (
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Admin />
          </ProtectedRoute>
        ),
      },
      {
        path: '403',
        element: <Forbidden />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router;
