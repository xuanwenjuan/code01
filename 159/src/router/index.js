import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '系统首页', icon: 'HomeFilled' }
      },
      {
        path: 'contacts',
        name: 'Contacts',
        component: () => import('@/views/contacts/index.vue'),
        meta: { title: '员工通讯录', icon: 'User' }
      },
      {
        path: 'approval',
        name: 'Approval',
        redirect: '/approval/my',
        meta: { title: '审批流程', icon: 'DocumentChecked' },
        children: [
          {
            path: 'my',
            name: 'MyApproval',
            component: () => import('@/views/approval/my.vue'),
            meta: { title: '我的审批' }
          },
          {
            path: 'pending',
            name: 'PendingApproval',
            component: () => import('@/views/approval/pending.vue'),
            meta: { title: '待我审批' }
          },
          {
            path: 'leave',
            name: 'LeaveApproval',
            component: () => import('@/views/approval/leave.vue'),
            meta: { title: '发起请假审批' }
          },
          {
            path: 'business',
            name: 'BusinessApproval',
            component: () => import('@/views/approval/business.vue'),
            meta: { title: '发起出差审批' }
          }
        ]
      },
      {
        path: 'files',
        name: 'Files',
        component: () => import('@/views/files/index.vue'),
        meta: { title: '文件资料', icon: 'Folder' }
      },
      {
        path: 'profile',
        name: 'Profile',
        redirect: '/profile/info',
        meta: { title: '个人中心', icon: 'UserFilled' },
        children: [
          {
            path: 'info',
            name: 'ProfileInfo',
            component: () => import('@/views/profile/info.vue'),
            meta: { title: '账号信息' }
          },
          {
            path: 'password',
            name: 'ProfilePassword',
            component: () => import('@/views/profile/password.vue'),
            meta: { title: '修改密码' }
          },
          {
            path: 'schedule',
            name: 'ProfileSchedule',
            component: () => import('@/views/profile/schedule.vue'),
            meta: { title: '我的日程' }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  document.title = to.meta.title ? `${to.meta.title} - 企业OA系统` : '企业OA系统'
  
  if (to.meta.requiresAuth === false) {
    next()
  } else if (!userStore.token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
