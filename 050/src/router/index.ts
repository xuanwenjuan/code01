import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '工作台', icon: 'Odometer' }
      },
      {
        path: 'customer',
        name: 'Customer',
        component: () => import('@/views/customer/index.vue'),
        meta: { title: '报关企业客户管理', icon: 'OfficeBuilding' }
      },
      {
        path: 'product',
        name: 'Product',
        component: () => import('@/views/product/index.vue'),
        meta: { title: '商品备案类目管理', icon: 'Box' }
      },
      {
        path: 'declaration',
        name: 'Declaration',
        component: () => import('@/views/declaration/index.vue'),
        meta: { title: '报关单业务管理', icon: 'Document' }
      },
      {
        path: 'settlement',
        name: 'Settlement',
        component: () => import('@/views/settlement/index.vue'),
        meta: { title: '费用对账结算管理', icon: 'Money' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
