import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import LoadingState from '@/components/Common/LoadingState'
import AuthRoute from '@/components/Auth/AuthRoute'

const { Content } = Layout

const Home = lazy(() => import('@/pages/Home'))
const ServiceList = lazy(() => import('@/pages/ServiceList'))
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail'))
const Booking = lazy(() => import('@/pages/Booking'))
const Login = lazy(() => import('@/pages/Login'))
const Profile = lazy(() => import('@/pages/Profile'))
const ProfileOrders = lazy(() => import('@/pages/Profile/Orders'))
const ProfileFavorites = lazy(() => import('@/pages/Profile/Favorites'))
const ProfileBabies = lazy(() => import('@/pages/Profile/Babies'))
const ProfileReviews = lazy(() => import('@/pages/Profile/Reviews'))
const ProfileEdit = lazy(() => import('@/pages/Profile/Edit'))
const Nannies = lazy(() => import('@/pages/Nannies'))
const About = lazy(() => import('@/pages/About'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const App = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ background: '#fff5f8' }}>
        <Suspense fallback={<LoadingState />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/nannies" element={<Nannies />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/booking/:serviceId"
              element={
                <AuthRoute requiredRole="mom">
                  <Booking />
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
            <Route
              path="/profile/orders"
              element={
                <AuthRoute>
                  <ProfileOrders />
                </AuthRoute>
              }
            />
            <Route
              path="/profile/favorites"
              element={
                <AuthRoute>
                  <ProfileFavorites />
                </AuthRoute>
              }
            />
            <Route
              path="/profile/babies"
              element={
                <AuthRoute requiredRole="mom">
                  <ProfileBabies />
                </AuthRoute>
              }
            />
            <Route
              path="/profile/reviews"
              element={
                <AuthRoute>
                  <ProfileReviews />
                </AuthRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <AuthRoute>
                  <ProfileEdit />
                </AuthRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Content>
      <Footer />
    </Layout>
  )
}

export default App
