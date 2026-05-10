import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据概览', icon: 'DataLine' }
      },
      {
        path: 'departments',
        name: 'Departments',
        component: () => import('@/views/Departments.vue'),
        meta: { title: '科室管理', icon: 'OfficeBuilding' }
      },
      {
        path: 'doctors',
        name: 'Doctors',
        component: () => import('@/views/Doctors.vue'),
        meta: { title: '医生管理', icon: 'UserFilled' }
      },
      {
        path: 'registrations',
        name: 'Registrations',
        component: () => import('@/views/Registrations.vue'),
        meta: { title: '挂号管理', icon: 'Tickets' }
      },
      {
        path: 'clinic',
        name: 'Clinic',
        component: () => import('@/views/Clinic.vue'),
        meta: { title: '就诊管理', icon: 'Monitor' }
      },
      {
        path: 'prescriptions',
        name: 'Prescriptions',
        component: () => import('@/views/Prescriptions.vue'),
        meta: { title: '处方管理', icon: 'Document' }
      },
      {
        path: 'audit',
        name: 'Audit',
        component: () => import('@/views/Audit.vue'),
        meta: { title: '操作审计', icon: 'Notebook' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
