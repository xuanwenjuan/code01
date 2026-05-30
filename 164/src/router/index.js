import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', requiresAuth: false }
  },
  {
    path: '/list',
    name: 'List',
    component: () => import('@/views/List.vue'),
    meta: { title: '商品列表', requiresAuth: false }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/Detail.vue'),
    meta: { title: '商品详情', requiresAuth: false }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { title: '购物车', requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/Checkout.vue'),
    meta: { title: '确认订单', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false, hideHeader: true, hideFooter: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', requiresAuth: false, hideHeader: true, hideFooter: true }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/user/Layout.vue'),
    meta: { title: '个人中心', requiresAuth: true },
    redirect: '/user/profile',
    children: [
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人信息', requiresAuth: true }
      },
      {
        path: 'address',
        name: 'Address',
        component: () => import('@/views/user/Address.vue'),
        meta: { title: '收货地址', requiresAuth: true }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/user/Orders.vue'),
        meta: { title: '我的订单', requiresAuth: true }
      },
      {
        path: 'order-detail/:id',
        name: 'OrderDetail',
        component: () => import('@/views/user/OrderDetail.vue'),
        meta: { title: '订单详情', requiresAuth: true }
      },
      {
        path: 'wishlist',
        name: 'Wishlist',
        component: () => import('@/views/user/Wishlist.vue'),
        meta: { title: '心愿单', requiresAuth: true }
      },
      {
        path: 'footprints',
        name: 'Footprints',
        component: () => import('@/views/user/Footprints.vue'),
        meta: { title: '浏览足迹', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在', requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 花语轩` : '花语轩 - 鲜花花艺礼品订购平台'

  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    ElMessage.warning('请先登录')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  if ((to.path === '/login' || to.path === '/register') && token) {
    next('/')
    return
  }

  next()
})

export default router
