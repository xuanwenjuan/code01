<template>
  <header class="app-header">
    <div class="container flex-between">
      <div class="logo" @click="goHome">
        <el-icon :size="32" color="#409eff"><Brush /></el-icon>
        <span class="logo-text">模型喷涂耗材</span>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/products" class="nav-item">商品中心</router-link>
        <router-link to="/color-schemes" class="nav-item">配色方案</router-link>
      </nav>
      
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <router-link to="/favorites" class="header-icon" v-if="userStore.isBuyer">
          <el-badge :value="favoriteStore.favoriteCount" :hidden="favoriteStore.favoriteCount === 0">
            <el-icon :size="20"><Star /></el-icon>
          </el-badge>
        </router-link>
        
        <div class="user-area">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown trigger="click">
              <div class="user-info">
                <el-avatar :size="32" :src="userStore.currentUser?.avatar" />
                <span class="username">{{ userStore.currentUser?.nickname }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goProfile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="goOrders" v-if="userStore.isBuyer">
                    <el-icon><List /></el-icon>我的订单
                  </el-dropdown-item>
                  <el-dropdown-item @click="goFavorites" v-if="userStore.isBuyer">
                    <el-icon><Star /></el-icon>我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item @click="goSupplier" v-if="userStore.isSupplier">
                    <el-icon><Management /></el-icon>供应商管理
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" class="login-btn">
              <el-icon><User /></el-icon>登录
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useFavoriteStore } from '@/stores/favorite'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

const searchKeyword = ref('')

function goHome() {
  router.push('/')
}

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ name: 'Products', query: { keyword: searchKeyword.value } })
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

<style scoped lang="scss">
.app-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  
  .logo-text {
    font-size: 20px;
    font-weight: bold;
  }
}

.nav-menu {
  display: flex;
  gap: 30px;
  
  .nav-item {
    color: rgba(255, 255, 255, 0.9);
    font-size: 15px;
    padding: 20px 0;
    position: relative;
    transition: color 0.3s;
    
    &:hover, &.router-link-active {
      color: #fff;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: #fff;
        border-radius: 2px;
      }
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-input {
  width: 250px;
  
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.2);
    box-shadow: none;
    
    &.is-focus {
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
    }
  }
  
  :deep(.el-input__inner) {
    color: #fff;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
  }
  
  :deep(.el-input__prefix-inner), :deep(.el-input__clear) {
    color: rgba(255, 255, 255, 0.8);
  }
}

.header-icon {
  color: #fff;
  position: relative;
  padding: 8px;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
}

.user-area {
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    
    .username {
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  .login-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    transition: background 0.3s;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
