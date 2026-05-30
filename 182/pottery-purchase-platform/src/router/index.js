import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: () => import('@/views/Category/index.vue'),
    meta: { title: '商品分类' }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail/index.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/tutorials',
    name: 'Tutorials',
    component: () => import('@/views/Tutorials/index.vue'),
    meta: { title: '陶艺教程' }
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
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/UserCenter/index.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/user/orders',
    name: 'MyOrders',
    component: () => import('@/views/UserCenter/Orders.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/user/favorites',
    name: 'MyFavorites',
    component: () => import('@/views/UserCenter/Favorites.vue'),
    meta: { title: '我的收藏', requiresAuth: true }
  },
  {
    path: '/supplier',
    name: 'SupplierCenter',
    component: () => import('@/views/SupplierCenter/index.vue'),
    meta: { title: '供应商中心', requiresAuth: true, requiresSupplier: true }
  },
  {
    path: '/supplier/products',
    name: 'SupplierProducts',
    component: () => import('@/views/SupplierCenter/Products.vue'),
    meta: { title: '商品管理', requiresAuth: true, requiresSupplier: true }
  },
  {
    path: '/supplier/orders',
    name: 'SupplierOrders',
    component: () => import('@/views/SupplierCenter/Orders.vue'),
    meta: { title: '订单管理', requiresAuth: true, requiresSupplier: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresSupplier && userStore.userInfo?.role !== 'supplier') {
    next('/')
  } else {
    next()
  }
})

export default router
