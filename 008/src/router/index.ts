import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页 - 库存概览' }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/Categories.vue'),
    meta: { title: '食材分类管理' }
  },
  {
    path: '/food-items',
    name: 'FoodItems',
    component: () => import('@/views/FoodItems.vue'),
    meta: { title: '食材信息管理' }
  },
  {
    path: '/operations',
    name: 'Operations',
    component: () => import('@/views/Operations.vue'),
    meta: { title: '食材出入库管理' }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/Logs.vue'),
    meta: { title: '操作履历日志' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || '社区生鲜食材库存管理系统'
  next()
})

export default router
