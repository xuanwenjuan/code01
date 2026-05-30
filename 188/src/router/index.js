import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

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
    meta: { title: '首页' }
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: () => import('@/views/Category.vue'),
    meta: { title: '商品分类' }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/special/:type',
    name: 'SpecialZone',
    component: () => import('@/views/SpecialZone.vue'),
    meta: { title: '专区' }
  },
  {
    path: '/package',
    name: 'Package',
    component: () => import('@/views/Package.vue'),
    meta: { title: '采购套餐' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/Index.vue'),
    meta: { title: '个人中心', requiresAuth: true },
    redirect: '/profile/orders',
    children: [
      {
        path: 'orders',
        name: 'ProfileOrders',
        component: () => import('@/views/profile/Orders.vue'),
        meta: { title: '我的订单' }
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
        path: 'products',
        name: 'SupplierProducts',
        component: () => import('@/views/profile/SupplierProducts.vue'),
        meta: { title: '商品管理', requiresSupplier: true }
      },
      {
        path: 'orders-manage',
        name: 'SupplierOrders',
        component: () => import('@/views/profile/SupplierOrders.vue'),
        meta: { title: '订单管理', requiresSupplier: true }
      }
    ]
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
  document.title = to.meta.title ? `${to.meta.title} - 园林园艺资材采购平台` : '园林园艺资材采购平台'
  
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresSupplier && userStore.userRole !== 'supplier') {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
