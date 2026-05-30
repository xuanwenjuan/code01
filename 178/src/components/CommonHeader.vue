<template>
  <header class="header">
    <div class="header-top">
      <div class="container">
        <div class="top-left">
          <span class="welcome-text">🌿 欢迎来到绿植盆栽选购平台</span>
        </div>
        <div class="top-right">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar :size="24" :src="userStore.user.avatar" />
                <span class="username">{{ userStore.user.nickname }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="center">
                    <el-icon><User /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="orders">
                    <el-icon><Tickets /></el-icon>
                    我的订单
                  </el-dropdown-item>
                  <el-dropdown-item command="favorites">
                    <el-icon><Star /></el-icon>
                    我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" class="login-link">
              <el-icon><User /></el-icon>
              登录 / 注册
            </router-link>
          </template>
        </div>
      </div>
    </div>
    <div class="header-main">
      <div class="container">
        <div class="logo" @click="goHome">
          <span class="logo-icon">🌱</span>
          <span class="logo-text">绿植之家</span>
        </div>
        <nav class="nav-menu">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/knowledge" class="nav-item">养护知识</router-link>
        </nav>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索绿植..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon class="search-icon"><Search /></el-icon>
            </template>
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
        <div class="header-actions">
          <router-link to="/favorites" class="action-item">
            <el-badge :value="favoriteCount" class="favorite-badge">
              <el-icon :size="20"><Star /></el-icon>
            </el-badge>
            <span>收藏</span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()
const searchKeyword = ref('')

const favoriteCount = computed(() => orderStore.userFavorites.length)

const goHome = () => {
  router.push('/')
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/', query: { keyword: searchKeyword.value } })
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'center':
      router.push('/user')
      break
    case 'orders':
      router.push('/orders')
      break
    case 'favorites':
      router.push('/favorites')
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
      break
  }
}
</script>

<style scoped>
.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-top {
  background: linear-gradient(90deg, #2d5a27 0%, #4a7c42 100%);
  color: #fff;
  font-size: 13px;
  padding: 8px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-size: 14px;
}

.login-link {
  color: #fff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.login-link:hover {
  text-decoration: underline;
}

.header-main {
  padding: 15px 0;
  background: #fff;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.logo-icon {
  font-size: 32px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #2d5a27;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-item {
  text-decoration: none;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #2d5a27;
}

.nav-item.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #2d5a27;
}

.search-box {
  flex: 1;
  max-width: 400px;
  margin: 0 30px;
}

.search-input {
  width: 100%;
}

.search-icon {
  color: #999;
}

.header-actions {
  display: flex;
  gap: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  font-size: 12px;
  gap: 4px;
  transition: color 0.3s;
}

.action-item:hover {
  color: #2d5a27;
}

.favorite-badge :deep(.el-badge__content) {
  background: #f56c6c;
}
</style>
