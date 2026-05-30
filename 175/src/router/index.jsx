import { Navigate } from 'react-router-dom'
import Layout from '@/layout'
import Home from '@/pages/Home'
import ServiceDetail from '@/pages/ServiceDetail'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'
import Orders from '@/pages/Orders'
import OrderDetail from '@/pages/OrderDetail'
import Feedback from '@/pages/Feedback'
import MasterOrders from '@/pages/MasterOrders'

const routes = [
  {
    path: '/login',
    element: <Login />,
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    element: <Register />,
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />
      },
      {
        path: 'home',
        element: <Home />,
        meta: { title: '首页', requiresAuth: false }
      },
      {
        path: 'service/:id',
        element: <ServiceDetail />,
        meta: { title: '服务详情', requiresAuth: false }
      },
      {
        path: 'profile',
        element: <Profile />,
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: 'orders',
        element: <Orders />,
        meta: { title: '我的订单', requiresAuth: true, roles: ['user'] }
      },
      {
        path: 'master/orders',
        element: <MasterOrders />,
        meta: { title: '师傅订单', requiresAuth: true, roles: ['master'] }
      },
      {
        path: 'order/:id',
        element: <OrderDetail />,
        meta: { title: '订单详情', requiresAuth: true }
      },
      {
        path: 'feedback/:id',
        element: <Feedback />,
        meta: { title: '服务反馈', requiresAuth: true, roles: ['user'] }
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/home" replace />
  }
]

export default routes
