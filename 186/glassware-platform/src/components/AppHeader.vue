<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <el-icon size="32" color="#409eff"><Cup /></el-icon>
          <span class="logo-text">实验室玻璃器皿采购平台</span>
        </div>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索玻璃器皿..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <nav class="nav-menu">
          <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">首页</router-link>
          <router-link to="/package" class="nav-item" :class="{ active: route.path === '/package' }">套餐专区</router-link>
          <router-link v-if="userStore.isLoggedIn" to="/orders" class="nav-item" :class="{ active: route.path === '/orders' }">我的订单</router-link>
          <router-link v-if="userStore.isLoggedIn" to="/favorites" class="nav-item" :class="{ active: route.path === '/favorites' }">我的收藏</router-link>
        </nav>
        <div class="user-area">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="36" :src="userStore.currentUser.avatar" />
                <span class="user-name">{{ userStore.currentUser.name }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
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
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const searchKeyword = ref('')

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
      ElMessage.success('退出登录成功')
      router.push('/')
      break
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;

  .header-content {
    display: flex;
    align-items: center;
    height: 70px;
    gap: 30px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      white-space: nowrap;
    }
  }

  .search-box {
    flex: 1;
    max-width: 400px;

    .search-input {
      :deep(.el-input__wrapper) {
        border-radius: 20px;
        padding: 0 15px;
      }
    }
  }

  .nav-menu {
    display: flex;
    gap: 25px;

    .nav-item {
      color: #606266;
      font-size: 15px;
      transition: color 0.3s;
      padding: 5px 0;
      position: relative;

      &:hover,
      &.active {
        color: #409eff;
      }

      &.active::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        right: 0;
        height: 2px;
        background: #409eff;
        border-radius: 1px;
      }
    }
  }

  .user-area {
    display: flex;
    align-items: center;
    gap: 15px;

    .login-btn,
    .register-btn {
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      transition: all 0.3s;
    }

    .login-btn {
      color: #606266;
      border: 1px solid #dcdfe6;

      &:hover {
        color: #409eff;
        border-color: #409eff;
      }
    }

    .register-btn {
      background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
      color: #fff;

      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 20px;
      transition: background 0.3s;

      &:hover {
        background: #f5f7fa;
      }

      .user-name {
        font-size: 14px;
        color: #303133;
      }
    }
  }
}
</style>
