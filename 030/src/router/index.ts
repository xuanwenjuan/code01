import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '数据概览', icon: 'DataBoard' }
  },
  {
    path: '/buildings',
    name: 'Buildings',
    component: () => import('@/views/BuildingManagement.vue'),
    meta: { title: '楼宇与住户管理', icon: 'OfficeBuilding' }
  },
  {
    path: '/work-orders',
    name: 'WorkOrders',
    component: () => import('@/views/WorkOrderManagement.vue'),
    meta: { title: '报修与工单管理', icon: 'Document' }
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('@/views/PaymentManagement.vue'),
    meta: { title: '缴费管理', icon: 'Money' }
  },
  {
    path: '/operation-logs',
    name: 'OperationLogs',
    component: () => import('@/views/OperationLogs.vue'),
    meta: { title: '操作履历与审计', icon: 'Clock' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
