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
    path: '/list',
    name: 'List',
    component: () => import('@/views/List.vue'),
    meta: { title: '配件列表' }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/Detail.vue'),
    meta: { title: '配件详情' }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { title: '购物车', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', fullPage: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', fullPage: true }
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
        name: 'Orders',
        component: () => import('@/views/profile/Orders.vue'),
        meta: { title: '我的订单' }
      },
      {
        path: 'address',
        name: 'Address',
        component: () => import('@/views/profile/Address.vue'),
        meta: { title: '收货地址' }
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: () => import('@/views/profile/Favorites.vue'),
        meta: { title: '我的收藏' }
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('@/views/profile/History.vue'),
        meta: { title: '浏览记录' }
      },
      {
        path: 'info',
        name: 'Info',
        component: () => import('@/views/profile/Info.vue'),
        meta: { title: '个人资料' }
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
  const userStore = useUserStore()
  document.title = to.meta.title ? `${to.meta.title} - 汽车零部件` : '汽车零部件'
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
