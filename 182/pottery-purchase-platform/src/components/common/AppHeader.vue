<template>
  <header class="app-header">
    <div class="top-bar">
      <div class="container flex-between">
        <div class="welcome-text">欢迎来到陶艺工具采购平台！</div>
        <div class="user-actions">
          <template v-if="userStore.isLoggedIn">
            <span class="welcome-user">
              <el-icon><User /></el-icon>
              {{ userStore.userInfo?.nickname }}
            </span>
            <router-link to="/user" class="action-link">个人中心</router-link>
            <router-link v-if="userStore.userInfo?.role === 'supplier'" to="/supplier" class="action-link">
              供应商中心
            </router-link>
            <a href="javascript:;" class="action-link" @click="handleLogout">退出登录</a>
          </template>
          <template v-else>
            <router-link to="/login" class="action-link">请登录</router-link>
            <router-link to="/register" class="action-link">免费注册</router-link>
          </template>
        </div>
      </div>
    </div>
    <div class="main-header">
      <div class="container flex-between">
        <router-link to="/" class="logo">
          <span class="logo-icon">🏺</span>
          <span class="logo-text">陶艺工坊</span>
        </router-link>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索陶艺工具..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        <div class="header-right">
          <router-link to="/user/favorites" class="header-item">
            <el-badge :value="appStore.favorites.length" :hidden="appStore.favorites.length === 0">
              <el-icon :size="24"><Star /></el-icon>
            </el-badge>
            <span>我的收藏</span>
          </router-link>
          <router-link to="/user/orders" class="header-item">
            <el-icon :size="24"><ShoppingBag /></el-icon>
            <span>我的订单</span>
          </router-link>
        </div>
      </div>
    </div>
    <nav class="nav-bar">
      <div class="container">
        <ul class="nav-list flex">
          <li class="nav-item">
            <router-link to="/" class="nav-link">首页</router-link>
          </li>
          <li v-for="cat in appStore.categories" :key="cat.id" class="nav-item">
            <router-link :to="`/category/${cat.id}`" class="nav-link">
              {{ cat.icon }} {{ cat.name }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tutorials" class="nav-link">
              <el-icon><VideoPlay /></el-icon> 陶艺教程
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()
const searchKeyword = ref('')

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/category/0', query: { keyword: searchKeyword.value } })
  }
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.top-bar {
  background: #f8f8f8;
  height: 36px;
  line-height: 36px;
  font-size: 12px;
  color: #666;
}

.welcome-text {
  color: #999;
}

.user-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.welcome-user {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #d4a574;
}

.action-link {
  color: #666;
  transition: color 0.3s;
}

.action-link:hover {
  color: #d4a574;
}

.main-header {
  padding: 20px 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-icon {
  font-size: 40px;
}

.logo-text {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(135deg, #d4a574, #c49060);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-box {
  width: 500px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
}

.header-right {
  display: flex;
  gap: 30px;
}

.header-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.header-item:hover {
  color: #d4a574;
}

.nav-bar {
  background: linear-gradient(135deg, #d4a574, #c49060);
}

.nav-list {
  height: 50px;
  line-height: 50px;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: block;
  padding: 0 24px;
  color: #fff;
  font-size: 15px;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.3);
}
</style>
