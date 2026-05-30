import { Navigate } from 'react-router-dom'
import AuthRoute from './AuthRoute'

const Home = () => import('@/pages/Home')
const ServiceList = () => import('@/pages/ServiceList')
const ServiceDetail = () => import('@/pages/ServiceDetail')
const Booking = () => import('@/pages/Booking')
const Profile = () => import('@/pages/Profile')
const Login = () => import('@/pages/Login')
const Orders = () => import('@/pages/Orders')
const Addresses = () => import('@/pages/Addresses')
const Favorites = () => import('@/pages/Favorites')
const UserSettings = () => import('@/pages/UserSettings')

export const routes = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/services',
    element: <ServiceList />
  },
  {
    path: '/service/:id',
    element: <ServiceDetail />
  },
  {
    path: '/booking',
    element: (
      <AuthRoute>
        <Booking />
      </AuthRoute>
    )
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/profile',
    element: (
      <AuthRoute>
        <Profile />
      </AuthRoute>
    ),
    children: [
      { path: '', element: <Navigate to="orders" replace /> },
      { path: 'orders', element: <Orders /> },
      { path: 'addresses', element: <Addresses /> },
      { path: 'favorites', element: <Favorites /> },
      { path: 'settings', element: <UserSettings /> }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]
