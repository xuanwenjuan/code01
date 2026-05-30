import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/plant/:id',
    name: 'PlantDetail',
    component: () => import('@/views/PlantDetail.vue'),
    meta: { title: '绿植详情' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', guestOnly: true }
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/UserCenter.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'MyOrders',
    component: () => import('@/views/MyOrders.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'MyFavorites',
    component: () => import('@/views/MyFavorites.vue'),
    meta: { title: '我的收藏', requiresAuth: true }
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('@/views/Knowledge.vue'),
    meta: { title: '养护知识' }
  },
  {
    path: '/knowledge/:id',
    name: 'KnowledgeDetail',
    component: () => import('@/views/KnowledgeDetail.vue'),
    meta: { title: '养护知识详情' }
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
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 绿植盆栽选购平台` : '绿植盆栽选购平台'
  
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const isLoggedIn = user && user.isLoggedIn
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    ElMessage.warning('请先登录后再访问')
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath }
    })
    return
  }
  
  if (to.meta.guestOnly && isLoggedIn) {
    ElMessage.info('您已登录，无需重复登录')
    next({ path: '/' })
    return
  }
  
  next()
})

router.afterEach((to, from) => {
  window.scrollTo(0, 0)
})

export default router
