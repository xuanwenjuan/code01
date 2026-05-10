import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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
        meta: { title: '工作台' }
      },
      {
        path: 'warehouse',
        name: 'Warehouse',
        component: () => import('@/views/Warehouse.vue'),
        meta: { title: '仓库与货位管理' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/Inventory.vue'),
        meta: { title: '库存管理' }
      },
      {
        path: 'inbound',
        name: 'Inbound',
        component: () => import('@/views/Inbound.vue'),
        meta: { title: '入库管理' }
      },
      {
        path: 'outbound',
        name: 'Outbound',
        component: () => import('@/views/Outbound.vue'),
        meta: { title: '出库管理' }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/OperationLogs.vue'),
        meta: { title: '操作履历' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title as string} - 智慧物流仓储综合管理系统`
  next()
})

export default router
