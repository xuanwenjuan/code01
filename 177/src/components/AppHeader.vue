<template>
  <header class="app-header">
    <div class="container header-inner">
      <div class="logo" @click="goHome">
        <span class="logo-icon">🎨</span>
        <span class="logo-text">手作DIY商城</span>
      </div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/" class="nav-item">材料商城</router-link>
        <router-link to="/" class="nav-item">教程中心</router-link>
      </nav>
      <div class="header-right">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.currentUser.avatar" />
              <span class="username">{{ userStore.currentUser.nickname }}</span>
              <el-tag v-if="userStore.isBlogger" type="warning" size="small" class="blogger-tag">博主</el-tag>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon> 个人中心
                </el-dropdown-item>
                <el-dropdown-item command="orders">
                  <el-icon><ShoppingBag /></el-icon> 我的订单
                </el-dropdown-item>
                <el-dropdown-item command="favorites">
                  <el-icon><Star /></el-icon> 我的收藏
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login" class="login-btn">
            <el-button type="primary">登录</el-button>
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { User, ShoppingBag, Star, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const goHome = () => {
  router.push('/')
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  z-index: 1000;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  
  .logo-icon {
    font-size: 28px;
    margin-right: 8px;
  }
  
  .logo-text {
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.nav-menu {
  display: flex;
  gap: 32px;
  
  .nav-item {
    color: #666;
    font-size: 15px;
    transition: color 0.3s;
    
    &:hover,
    &.router-link-active {
      color: #667eea;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 20px;
  transition: background 0.3s;
  
  &:hover {
    background: #f5f5f5;
  }
  
  .username {
    margin: 0 8px;
    font-size: 14px;
    color: #333;
  }
  
  .blogger-tag {
    margin-left: 4px;
  }
}

.login-btn {
  margin-left: 16px;
}
</style>
