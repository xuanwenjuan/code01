import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/material'
  },
  {
    path: '/material',
    name: 'Material',
    component: () => import('@/views/material/index.vue')
  },
  {
    path: '/designer',
    name: 'Designer',
    component: () => import('@/views/designer/index.vue')
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/order/index.vue')
  },
  {
    path: '/contract',
    name: 'Contract',
    component: () => import('@/views/contract/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
