import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('@/views/Category.vue')
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue')
  },
  {
    path: '/zone/:type',
    name: 'Zone',
    component: () => import('@/views/Zone.vue')
  },
  {
    path: '/package',
    name: 'Package',
    component: () => import('@/views/Package.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/center',
    name: 'Center',
    component: () => import('@/views/Center.vue'),
    meta: { requiresAuth: true },
    redirect: '/center/orders',
    children: [
      {
        path: 'orders',
        name: 'CenterOrders',
        component: () => import('@/views/center/Orders.vue')
      },
      {
        path: 'favorites',
        name: 'CenterFavorites',
        component: () => import('@/views/center/Favorites.vue')
      },
      {
        path: 'profile',
        name: 'CenterProfile',
        component: () => import('@/views/center/Profile.vue')
      }
    ]
  },
  {
    path: '/supplier',
    name: 'Supplier',
    component: () => import('@/views/Supplier.vue'),
    meta: { requiresAuth: true, requiresRole: 'supplier' }
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
  userStore.checkLogin()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresRole && userStore.userRole !== to.meta.requiresRole) {
    next('/')
  } else {
    next()
  }
})

export default router
