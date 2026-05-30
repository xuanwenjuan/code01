<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="logo" @click="$router.push('/')">
        <el-icon :size="32" color="#409eff"><Reading /></el-icon>
        <span class="logo-text">线上书店采购平台</span>
      </div>
      
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索图书名称、作者..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <nav class="nav-menu">
        <router-link to="/" class="nav-item">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </router-link>
        
        <template v-if="userStore.isLoggedIn">
          <router-link v-if="userStore.isBuyer" to="/center" class="nav-item">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </router-link>
          <router-link v-if="userStore.isMerchant" to="/merchant" class="nav-item">
            <el-icon><Shop /></el-icon>
            <span>商家后台</span>
          </router-link>
        </template>

        <div class="user-area">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar :size="32" class="user-avatar">
                  {{ userStore.userInfo?.name?.charAt(0) }}
                </el-avatar>
                <span class="user-name">{{ userStore.userInfo?.name }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人信息
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>退出登录
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
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useBookStore } from '@/stores/book'

const router = useRouter()
const userStore = useUserStore()
const bookStore = useBookStore()
const searchKeyword = ref('')

const handleSearch = () => {
  bookStore.searchKeyword = searchKeyword.value
  router.push('/')
}

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/')
  } else if (command === 'profile') {
    if (userStore.isBuyer) {
      router.push('/center')
    } else {
      router.push('/merchant')
    }
  }
}
</script>

<style scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  height: 64px;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(90deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 15px;
  transition: color 0.3s;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.user-area {
  margin-left: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  background: linear-gradient(135deg, #409eff, #67c23a);
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.login-btn {
  margin-left: 16px;
}
</style>
