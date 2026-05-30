import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/material/:id',
    name: 'MaterialDetail',
    component: () => import('@/views/MaterialDetail/index.vue'),
    meta: { title: '原料详情' }
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: () => import('@/views/Category/index.vue'),
    meta: { title: '原料分类' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register/index.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile/index.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders/index.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
      path: '/favorites',
      name: 'Favorites',
      component: () => import('@/views/Favorites/index.vue'),
      meta: { title: '我的收藏', requiresAuth: true }
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: () => import('@/views/Statistics/index.vue'),
      meta: { title: '原料用量统计', requiresAuth: true }
    },
  {
    path: '/supplier',
    name: 'Supplier',
    component: () => import('@/views/Supplier/index.vue'),
    meta: { title: '供货商中心', requiresAuth: true, requiresSupplier: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  const userStore = useUserStore()
  document.title = `${to.meta.title || '陶瓷艺术原料采购平台'}`

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return '/login'
  } else if (to.meta.requiresSupplier && userStore.userInfo?.role !== 'supplier') {
    return '/'
  }
})

export default router
