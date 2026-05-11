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
    meta: { title: '概览', icon: 'DataBoard' }
  },
  {
    path: '/books',
    name: 'Books',
    component: () => import('@/views/Books.vue'),
    meta: { title: '书籍管理', icon: 'Reading' }
  },
  {
    path: '/bookshelf',
    name: 'Bookshelf',
    component: () => import('@/views/Bookshelf.vue'),
    meta: { title: '我的书架', icon: 'Collection' }
  },
  {
    path: '/reading',
    name: 'Reading',
    component: () => import('@/views/Reading.vue'),
    meta: { title: '阅读进度', icon: 'Clock' }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/Logs.vue'),
    meta: { title: '操作履历', icon: 'Document' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '个人阅读管理系统'} - 个人智能阅读与藏书管理系统`
  next()
})

export default router
