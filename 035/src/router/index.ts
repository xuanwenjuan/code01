import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'DataLine' },
      },
      {
        path: 'bills',
        name: 'Bills',
        component: () => import('@/views/Bills.vue'),
        meta: { title: '账单管理', icon: 'Document' },
      },
      {
        path: 'budget',
        name: 'Budget',
        component: () => import('@/views/Budget.vue'),
        meta: { title: '预算管理', icon: 'Wallet' },
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/Logs.vue'),
        meta: { title: '操作履历', icon: 'List' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '财务系统'} - 个人智能财务与记账管理系统`
  next()
})

export default router
