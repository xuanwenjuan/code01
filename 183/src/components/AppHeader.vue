<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="logo" @click="$router.push('/')">
        <el-icon :size="32" color="#8b6914"><Camera /></el-icon>
        <span class="logo-text">复古胶片相机</span>
      </div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item" exact-active-class="active">首页</router-link>
        <router-link to="/cameras" class="nav-item" active-class="active">相机选购</router-link>
        <router-link to="/film-guide" class="nav-item" active-class="active">胶片指南</router-link>
      </nav>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索相机型号..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="user-actions">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar :size="32" :icon="UserFilled" />
                <span class="username">{{ userStore.userInfo?.nickname }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="orders">
                    <el-icon><List /></el-icon>我的订单
                  </el-dropdown-item>
                  <el-dropdown-item command="favorites">
                    <el-icon><Star /></el-icon>我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item v-if="userStore.isMerchant" command="merchant">
                    <el-icon><Shop /></el-icon>商家中心
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" class="login-btn">登录</router-link>
            <router-link to="/register" class="register-btn">注册</router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { Camera, Search, UserFilled, User, List, Star, Shop, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const searchKeyword = ref('')

onMounted(() => {
  userStore.checkAuth()
})

const handleSearch = () => {
  router.push({ name: 'Cameras', query: { keyword: searchKeyword.value } })
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'orders':
      router.push('/orders')
      break
    case 'favorites':
      router.push('/favorites')
      break
    case 'merchant':
      router.push('/merchant')
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
      break
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  background: linear-gradient(135deg, #2c2416 0%, #5d4e37 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-text {
  font-size: 22px;
  font-weight: bold;
  color: #f5e6c8;
  font-family: 'Georgia', serif;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-item {
  color: #d4c4a8;
  font-size: 16px;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s;
  
  &:hover, &.active {
    color: #f5e6c8;
  }
  
  &.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #8b6914;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-input {
  width: 220px;
  
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: none;
    
    &.is-focus {
      box-shadow: 0 0 0 2px rgba(139, 105, 20, 0.5);
    }
  }
  
  :deep(.el-input__inner),
  :deep(.el-input__placeholder) {
    color: #d4c4a8;
  }
  
  :deep(.el-input__prefix-inner) {
    color: #d4c4a8;
  }
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #f5e6c8;
  
  .username {
    font-size: 14px;
  }
}

.login-btn,
.register-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  transition: all 0.3s;
}

.login-btn {
  color: #f5e6c8;
  border: 1px solid #8b6914;
  
  &:hover {
    background: rgba(139, 105, 20, 0.3);
  }
}

.register-btn {
  background: #8b6914;
  color: #fff;
  
  &:hover {
    background: #a67c00;
  }
}
</style>
