import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/Products.vue'),
    meta: { title: '商品列表' }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/color-schemes',
    name: 'ColorSchemes',
    component: () => import('@/views/ColorSchemes.vue'),
    meta: { title: '配色方案' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', noAuth: true }
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
    meta: { title: '我的订单', requiresAuth: true, roles: ['buyer'] }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'),
    meta: { title: '我的收藏', requiresAuth: true, roles: ['buyer'] }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { title: '购物车', requiresAuth: true, roles: ['buyer'] }
  },
  {
    path: '/supplier',
    name: 'Supplier',
    component: () => import('@/views/Supplier.vue'),
    meta: { title: '供应商管理', requiresAuth: true, roles: ['supplier'] }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  document.title = to.meta.title ? `${to.meta.title} - 专业模型喷涂耗材采购平台` : '专业模型喷涂耗材采购平台'
  
  if (!userStore.isLoggedIn && userStore.token) {
    userStore.checkAuth()
  }
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  if (to.meta.roles && userStore.isLoggedIn) {
    if (!to.meta.roles.includes(userStore.currentUser?.role)) {
      ElMessage.error('您没有权限访问该页面')
      next(from.path || '/')
      return
    }
  }
  
  if (to.meta.noAuth && userStore.isLoggedIn) {
    next('/')
    return
  }
  
  next()
})

export default router
