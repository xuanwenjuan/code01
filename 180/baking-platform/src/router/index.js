import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetail.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('../views/UserCenter.vue'),
    redirect: '/user/orders',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'orders',
        name: 'UserOrders',
        component: () => import('../views/user/Orders.vue')
      },
      {
        path: 'favorites',
        name: 'UserFavorites',
        component: () => import('../views/user/Favorites.vue')
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('../views/user/Profile.vue')
      }
    ]
  },
  {
    path: '/merchant',
    name: 'MerchantCenter',
    component: () => import('../views/MerchantCenter.vue'),
    redirect: '/merchant/orders',
    meta: { requiresAuth: true, role: 'merchant' },
    children: [
      {
        path: 'orders',
        name: 'MerchantOrders',
        component: () => import('../views/merchant/Orders.vue')
      },
      {
        path: 'products',
        name: 'MerchantProducts',
        component: () => import('../views/merchant/Products.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录后再访问该页面')
      return { name: 'Login', query: { redirect: to.fullPath } }
    }
    
    if (to.meta.role && userStore.userInfo?.role !== to.meta.role) {
      ElMessage.error('您没有权限访问该页面')
      return '/'
    }
  }
  
  return true
})

export default router
