import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/house/list',
    name: 'HouseList',
    component: () => import('@/views/house/list.vue'),
    meta: { title: '房源列表' }
  },
  {
    path: '/house/detail/:id',
    name: 'HouseDetail',
    component: () => import('@/views/house/detail.vue'),
    meta: { title: '房源详情' }
  },
  {
    path: '/new-house',
    name: 'NewHouse',
    component: () => import('@/views/new-house/index.vue'),
    meta: { title: '楼盘专区' }
  },
  {
    path: '/new-house/detail/:id',
    name: 'NewHouseDetail',
    component: () => import('@/views/new-house/detail.vue'),
    meta: { title: '楼盘详情' }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('@/views/news/index.vue'),
    meta: { title: '楼盘快讯' }
  },
  {
    path: '/news/detail/:id',
    name: 'NewsDetail',
    component: () => import('@/views/news/detail.vue'),
    meta: { title: '资讯详情' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/user/register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/user/index.vue'),
    meta: { title: '个人中心', requiresAuth: true },
    redirect: '/user/profile',
    children: [
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/profile.vue'),
        meta: { title: '个人信息', requiresAuth: true }
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: () => import('@/views/user/favorites.vue'),
        meta: { title: '我的收藏', requiresAuth: true }
      },
      {
        path: 'appointments',
        name: 'Appointments',
        component: () => import('@/views/user/appointments.vue'),
        meta: { title: '预约记录', requiresAuth: true }
      },
      {
        path: 'footprints',
        name: 'Footprints',
        component: () => import('@/views/user/footprints.vue'),
        meta: { title: '浏览足迹', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' }
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
  document.title = to.meta.title ? `${to.meta.title} - 同城租房` : '同城租房'

  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLogin) {
    ElMessage.warning('请先登录')
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
