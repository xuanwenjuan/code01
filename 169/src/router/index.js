import Home from '@/pages/Home'
import ServiceList from '@/pages/ServiceList'
import ServiceDetail from '@/pages/ServiceDetail'
import Booking from '@/pages/Booking'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'
import Orders from '@/pages/Orders'
import Address from '@/pages/Address'
import Favorites from '@/pages/Favorites'
import Reviews from '@/pages/Reviews'
import UserInfo from '@/pages/UserInfo'
import NotFound from '@/pages/NotFound'

const routes = [
  { path: '/', element: Home, exact: true },
  { path: '/services', element: ServiceList },
  { path: '/service/:id', element: ServiceDetail },
  { path: '/booking/:id', element: Booking, protected: true, role: 'user' },
  { path: '/login', element: Login },
  { path: '/register', element: Register },
  { path: '/profile', element: Profile, protected: true },
  { path: '/orders', element: Orders, protected: true },
  { path: '/address', element: Address, protected: true },
  { path: '/favorites', element: Favorites, protected: true },
  { path: '/reviews', element: Reviews, protected: true },
  { path: '/userinfo', element: UserInfo, protected: true },
  { path: '*', element: NotFound }
]

export default routes
