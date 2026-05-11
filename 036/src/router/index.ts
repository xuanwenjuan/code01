import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/trips'
  },
  {
    path: '/trips',
    name: 'Trips',
    component: () => import('@/views/TripManagement.vue'),
    meta: { title: '行程管理' }
  },
  {
    path: '/checkin',
    name: 'CheckIn',
    component: () => import('@/views/CheckInBudget.vue'),
    meta: { title: '打卡与预算' }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/OperationLogs.vue'),
    meta: { title: '操作履历' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - 个人智能旅行计划与行程管理系统`
  }
  next()
})

export default router
