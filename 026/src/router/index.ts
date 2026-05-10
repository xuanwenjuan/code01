import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '首页概览', icon: 'HomeFilled' }
        },
        {
          path: 'employees',
          name: 'Employees',
          component: () => import('@/views/employees/index.vue'),
          meta: { title: '员工管理', icon: 'User' }
        },
        {
          path: 'approvals',
          name: 'Approvals',
          component: () => import('@/views/approvals/index.vue'),
          meta: { title: '审批管理', icon: 'Document' }
        },
        {
          path: 'operation-logs',
          name: 'OperationLogs',
          component: () => import('@/views/operation-logs/index.vue'),
          meta: { title: '操作日志', icon: 'Clock' }
        }
      ]
    }
  ]
})

export default router