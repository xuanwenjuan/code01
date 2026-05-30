import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
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
        meta: { title: '工作台', icon: 'DataBoard' }
      },
      {
        path: 'course-categories',
        name: 'CourseCategories',
        component: () => import('@/views/CourseCategories.vue'),
        meta: { title: '课程类目管理', icon: 'Menu' }
      },
      {
        path: 'teachers',
        name: 'Teachers',
        component: () => import('@/views/Teachers.vue'),
        meta: { title: '教师档案管理', icon: 'User' }
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/views/Students.vue'),
        meta: { title: '学员报名管理', icon: 'Avatar' }
      },
      {
        path: 'class-schedule',
        name: 'ClassSchedule',
        component: () => import('@/views/ClassSchedule.vue'),
        meta: { title: '班级课表排课', icon: 'Calendar' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
