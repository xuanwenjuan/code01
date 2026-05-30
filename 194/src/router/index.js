import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', requiresAuth: true }
  },
  {
    path: '/equipment/:id',
    name: 'EquipmentDetail',
    component: () => import('@/views/EquipmentDetail.vue'),
    meta: { title: '器材详情', requiresAuth: true }
  },
  {
    path: '/category/:type',
    name: 'Category',
    component: () => import('@/views/Category.vue'),
    meta: { title: '器材分类', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true },
    redirect: '/profile/orders',
    children: [
      {
        path: 'orders',
        name: 'ProfileOrders',
        component: () => import('@/views/profile/Orders.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'favorites',
        name: 'ProfileFavorites',
        component: () => import('@/views/profile/Favorites.vue'),
        meta: { title: '我的收藏' }
      },
      {
        path: 'info',
        name: 'ProfileInfo',
        component: () => import('@/views/profile/Info.vue'),
        meta: { title: '个人信息' }
      },
      {
        path: 'usage-stats',
        name: 'ProfileUsageStats',
        component: () => import('@/views/profile/UsageStats.vue'),
        meta: { title: '使用统计' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  document.title = to.meta.title ? `${to.meta.title} - 天文观测器材采购平台` : '天文观测器材采购平台'
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
