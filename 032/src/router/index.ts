import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '系统概览' }
  },
  {
    path: '/clubs',
    name: 'Clubs',
    component: () => import('@/views/Clubs.vue'),
    meta: { title: '社团管理' }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('@/views/Activities.vue'),
    meta: { title: '活动管理' }
  },
  {
    path: '/registrations',
    name: 'Registrations',
    component: () => import('@/views/Registrations.vue'),
    meta: { title: '报名管理' }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/Logs.vue'),
    meta: { title: '操作日志' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title as string} - 校园社团活动综合管理系统`
  next()
})

export default router
