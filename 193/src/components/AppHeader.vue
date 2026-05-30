<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="logo-section" @click="goHome">
        <el-icon :size="32" color="#409eff">
          <component :is="ShoppingBag" />
        </el-icon>
        <div class="logo-text">
          <h1>植物标本器材采购平台</h1>
          <p>专业的科研器材供应商</p>
        </div>
      </div>
      
      <div class="search-section">
        <el-input
          v-model="searchText"
          placeholder="搜索器材名称..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
      
      <nav class="nav-section">
        <router-link to="/" class="nav-item">首页</router-link>
        
        <el-dropdown v-if="userStore.isLoggedIn">
          <div class="nav-item user-info">
            <el-avatar :size="32" :src="userStore.user?.avatar" />
            <span>{{ userStore.user?.name }}</span>
            <el-icon><CaretBottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goProfile">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item @click="goOrders">
                <el-icon><List /></el-icon>
                我的订单
              </el-dropdown-item>
              <el-dropdown-item @click="goFavorites">
                <el-icon><StarFilled /></el-icon>
                我的收藏
              </el-dropdown-item>
              <el-dropdown-item v-if="userStore.isSupplier" @click="goSupplier">
                <el-icon><Management /></el-icon>
                供货商管理
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <router-link v-else to="/login" class="nav-item login-btn">
          <el-button type="primary">登录</el-button>
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useEquipmentStore } from '@/stores/equipment'
import { 
  ShoppingBag, Search, CaretBottom, User, List, 
  StarFilled, Management, SwitchButton 
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const equipmentStore = useEquipmentStore()

const searchText = ref('')

function goHome() {
  router.push('/')
}

function handleSearch() {
  equipmentStore.setSearchKeyword(searchText.value)
  if (router.currentRoute.value.name !== 'Home') {
    router.push('/')
  }
}

function goProfile() {
  router.push('/profile')
}

function goOrders() {
  router.push('/orders')
}

function goFavorites() {
  router.push('/favorites')
}

function goSupplier() {
  router.push('/supplier')
}

function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
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
  justify-content: space-between;
  height: 80px;
  gap: 40px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-text h1 {
  font-size: 18px;
  color: #303133;
  margin: 0;
  font-weight: bold;
}

.logo-text p {
  font-size: 12px;
  color: #909399;
  margin: 2px 0 0 0;
}

.search-section {
  flex: 1;
  max-width: 500px;
}

.search-input {
  width: 100%;
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-item {
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-item:hover {
  color: #409eff;
}

.user-info {
  gap: 8px;
}

.login-btn {
  padding: 0;
}
</style>
