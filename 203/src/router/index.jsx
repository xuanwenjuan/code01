import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import TypeList from '@/pages/Home/TypeList'
import TypeDetail from '@/pages/Home/TypeDetail'
import Technique from '@/pages/Technique'
import WorkList from '@/pages/Home/WorkList'
import WorkDetail from '@/pages/Home/WorkDetail'
import ArtisanList from '@/pages/Technique/ArtisanList'
import ArtisanDetail from '@/pages/Technique/ArtisanDetail'
import Login from '@/pages/Login'
import Profile from '@/pages/UserCenter/Profile'
import Favorites from '@/pages/UserCenter/Favorites'
import History from '@/pages/UserCenter/History'
import Admin from '@/pages/Admin'

const { Content } = Layout

const MainLayout = ({ children }) => (
  <Layout className="main-layout">
    <Header />
    <Content className="main-content">
      {children}
    </Content>
    <Footer />
  </Layout>
)

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    )
  },
  {
    path: '/types',
    element: (
      <MainLayout>
        <TypeList />
      </MainLayout>
    )
  },
  {
    path: '/types/:id',
    element: (
      <MainLayout>
        <TypeDetail />
      </MainLayout>
    )
  },
  {
    path: '/technique',
    element: (
      <MainLayout>
        <Technique />
      </MainLayout>
    )
  },
  {
    path: '/works',
    element: (
      <MainLayout>
        <WorkList />
      </MainLayout>
    )
  },
  {
    path: '/works/:id',
    element: (
      <MainLayout>
        <WorkDetail />
      </MainLayout>
    )
  },
  {
    path: '/artisans',
    element: (
      <MainLayout>
        <ArtisanList />
      </MainLayout>
    )
  },
  {
    path: '/artisans/:id',
    element: (
      <MainLayout>
        <ArtisanDetail />
      </MainLayout>
    )
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Profile />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/profile/favorites',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Favorites />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/profile/history',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <History />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <MainLayout>
          <Admin />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
])

export default router
