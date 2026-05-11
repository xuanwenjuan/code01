import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/medicine'
  },
  {
    path: '/medicine',
    name: 'Medicine',
    component: () => import('@/views/MedicineManage.vue'),
    meta: { title: '药品管理', icon: 'MedicineBox' }
  },
  {
    path: '/reminder',
    name: 'Reminder',
    component: () => import('@/views/ReminderManage.vue'),
    meta: { title: '用药管理', icon: 'AlarmClock' }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/OperationLogs.vue'),
    meta: { title: '操作日志', icon: 'Document' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
