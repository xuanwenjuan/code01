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
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/doctors',
    name: 'Doctors',
    component: () => import('@/views/DoctorManagement.vue')
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('@/views/ScheduleManagement.vue')
  },
  {
    path: '/registration',
    name: 'Registration',
    component: () => import('@/views/Registration.vue')
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/OperationLogs.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
