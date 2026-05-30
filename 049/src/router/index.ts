import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据概览' }
      },
      {
        path: 'coach',
        name: 'Coach',
        component: () => import('@/views/CoachManagement.vue'),
        meta: { title: '教练管理' }
      },
      {
        path: 'course',
        name: 'Course',
        component: () => import('@/views/CourseManagement.vue'),
        meta: { title: '课程管理' }
      },
      {
        path: 'member',
        name: 'Member',
        component: () => import('@/views/MemberManagement.vue'),
        meta: { title: '会员管理' }
      },
      {
        path: 'stats',
        name: 'Stats',
        component: () => import('@/views/Statistics.vue'),
        meta: { title: '消课统计' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
