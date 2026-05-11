import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Layout from '@/views/layout/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据概览', icon: 'DataBoard' }
      },
      {
        path: 'rooms',
        name: 'Rooms',
        component: () => import('@/views/rooms/index.vue'),
        meta: { title: '客房管理', icon: 'OfficeBuilding' }
      },
      {
        path: 'room-types',
        name: 'RoomTypes',
        component: () => import('@/views/room-types/index.vue'),
        meta: { title: '房型管理', icon: 'House' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/orders/index.vue'),
        meta: { title: '预订与入住', icon: 'Tickets' }
      },
      {
        path: 'operation-logs',
        name: 'OperationLogs',
        component: () => import('@/views/operation-logs/index.vue'),
        meta: { title: '操作履历', icon: 'Document' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
