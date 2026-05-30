<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="logo" @click="goHome">
        <el-icon :size="32" color="#409eff"><Camera /></el-icon>
        <span class="logo-text">星图采购平台</span>
      </div>

      <nav class="nav-menu">
        <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </router-link>
        <router-link to="/category/deepspace" class="nav-item" :class="{ active: route.path === '/category/deepspace' }">
          <el-icon><Moon /></el-icon>
          <span>深空器材</span>
        </router-link>
        <router-link to="/category/planet" class="nav-item" :class="{ active: route.path === '/category/planet' }">
          <el-icon><Sunny /></el-icon>
          <span>行星器材</span>
        </router-link>
        <router-link to="/category/all" class="nav-item" :class="{ active: route.path === '/category/all' }">
          <el-icon><Grid /></el-icon>
          <span>全部器材</span>
        </router-link>
      </nav>

      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索器材..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="user-info" v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand">
            <div class="user-dropdown">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                {{ userStore.userInfo?.name?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ userStore.userInfo?.name }}</span>
              <el-tag :type="userStore.isBuyer ? 'primary' : 'success'" size="small" class="role-tag">
                {{ userStore.isBuyer ? '采购方' : '供货商' }}
              </el-tag>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon> 个人中心
                </el-dropdown-item>
                <el-dropdown-item command="favorites">
                  <el-icon><StarFilled /></el-icon> 我的收藏
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Camera,
  HomeFilled,
  Moon,
  Sunny,
  Grid,
  Search,
  User,
  StarFilled,
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const searchKeyword = ref('')

function goHome() {
  router.push('/')
}

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/category/all', query: { keyword: searchKeyword.value } })
  }
}

function handleCommand(command) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'favorites':
      router.push('/profile/favorites')
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
      break
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  color: #606266;
  font-size: 14px;
  transition: all 0.3s;
}

.nav-item:hover {
  background: #ecf5ff;
  color: #409eff;
}

.nav-item.active {
  background: #409eff;
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-input {
  width: 240px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.3s;
}

.user-dropdown:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
}

.role-tag {
  margin-left: 4px;
}
</style>
