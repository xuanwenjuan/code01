import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/category'
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('@/views/category/index.vue')
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/views/inventory/index.vue')
  },
  {
    path: '/dealer',
    name: 'Dealer',
    component: () => import('@/views/dealer/index.vue')
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/order/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
