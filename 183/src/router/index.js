import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/cameras',
    name: 'Cameras',
    component: () => import('@/views/Cameras.vue'),
    meta: { title: '相机列表' }
  },
  {
    path: '/camera/:id',
    name: 'CameraDetail',
    component: () => import('@/views/CameraDetail.vue'),
    meta: { title: '相机详情' }
  },
  {
    path: '/film-guide',
    name: 'FilmGuide',
    component: () => import('@/views/FilmGuide.vue'),
    meta: { title: '胶片适配指南' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'),
    meta: { title: '我的收藏', requiresAuth: true }
  },
  {
    path: '/merchant',
    name: 'Merchant',
    component: () => import('@/views/Merchant.vue'),
    meta: { title: '商家中心', requiresAuth: true, requiresMerchant: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.title) {
    document.title = `${to.meta.title} - 复古胶片相机选购平台`
  }
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  if (to.meta.requiresMerchant && userStore.userInfo?.role !== 'merchant') {
    next({ name: 'Home' })
    return
  }
  
  next()
})

export default router
