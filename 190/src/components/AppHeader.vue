<template>
  <header class="app-header">
    <div class="header-top">
      <div class="container flex justify-between items-center">
      <div class="welcome-text">
        欢迎来到畜牧养殖器械采购平台！
        <template v-if="userStore.isLoggedIn">
          <span class="user-greeting">，{{ userStore.userInfo?.name }}</span>
          <span class="user-role">({{ userStore.userRole === 'purchaser' ? '采购方' : '供货商' }})</span>
        </template>
      </div>
      <div class="header-links">
        <template v-if="userStore.isLoggedIn">
          <el-button type="text" @click="goToCenter">个人中心</el-button>
          <el-button type="text" @click="handleLogout">退出登录</el-button>
        </template>
        <template v-else>
          <el-button type="text" @click="goToLogin">登录</el-button>
          <el-button type="text" @click="goToLogin">注册</el-button>
        </template>
      </div>
    </div>
    </div>
    <div class="header-main">
      <div class="container flex items-center justify-between">
        <div class="logo cursor-pointer" @click="goHome">
          <el-icon :size="36" color="#409eff">
            <Tools />
          </el-icon>
          <h1 class="logo-text">牧采通</h1>
        </div>
        <div class="search-box">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索养殖器械..." 
            style="width: 500px"
            size="large"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="large" @click="goToCart">
            <el-icon><ShoppingCart /></el-icon>
            <span>购物车</span>
            <el-badge :value="orderStore.cartList.length" class="cart-badge" />
          </el-button>
        </div>
      </div>
    </div>
    <nav class="nav-bar" v-if="showNav">
      <div class="container">
        <ul class="nav-list flex">
          <li class="nav-item" :class="{ active: activeMenu === 'home' }" @click="goHome">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </li>
          <li class="nav-item" :class="{ active: activeMenu === 'category' }" @click="goToCategory">
            <el-icon><Grid /></el-icon>
            <span>全部商品</span>
          </li>
          <li class="nav-item" :class="{ active: activeMenu === 'constantTemp' }" @click="goToZone('constantTemp')">
            <el-icon><Odometer /></el-icon>
            <span>恒温养殖</span>
          </li>
          <li class="nav-item" :class="{ active: activeMenu === 'disinfection' }" @click="goToZone('disinfection')">
            <el-icon><FirstAidKit /></el-icon>
            <span>防疫消毒</span>
          </li>
          <li class="nav-item" :class="{ active: activeMenu === 'package' }" @click="goToPackage">
            <el-icon><Present /></el-icon>
            <span>采购套餐</span>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const orderStore = useOrderStore()

const searchKeyword = ref('')
const showNav = computed(() => route.name !== 'Login')

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.includes('/category')) return 'category'
  if (path.includes('/zone/constantTemp')) return 'constantTemp'
  if (path.includes('/zone/disinfection')) return 'disinfection'
  if (path.includes('/package')) return 'package'
  return ''
})

function goHome() {
  router.push('/')
}

function goToLogin() {
  router.push('/login')
}

function goToCenter() {
  router.push('/center')
}

function goToCategory() {
  router.push('/category')
}

function goToZone(zone) {
  router.push(`/zone/${zone}`)
}

function goToPackage() {
  router.push('/package')
}

function goToCart() {
  router.push('/cart')
}

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value)}`)
  }
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  }).catch(() => {})
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-top {
  height: 36px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  line-height: 36px;
  font-size: 13px;
  color: #606266;
}

.welcome-text {
  .user-greeting {
    color: #409eff;
  }
  .user-role {
    color: #67c23a;
    margin-left: 5px;
  }
}

.header-links {
  a, .el-button {
    color: #606266;
    margin-left: 15px;
  }
}

.header-main {
  height: 80px;
  background: #fff;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
}

.cart-badge {
  margin-left: 5px;
}

.nav-bar {
  height: 50px;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
}

.nav-list {
  height: 100%;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  height: 100%;
  padding: 0 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.3);
  font-weight: bold;
}
</style>
