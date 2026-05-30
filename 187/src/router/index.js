import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: () => import('@/views/BookDetail.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/center',
    name: 'Center',
    component: () => import('@/views/Center.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/merchant',
    name: 'Merchant',
    component: () => import('@/views/Merchant.vue'),
    meta: { requiresAuth: true, role: 'merchant' }
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
  } else if (to.meta.role && userStore.userInfo?.role !== to.meta.role) {
    next('/')
  } else {
    next()
  }
})

export default router
