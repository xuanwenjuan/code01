<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="logo" @click="goHome">
        <el-icon :size="36" color="#8b6914"><Compass /></el-icon>
        <div class="logo-text">
          <h1>考古勘探器材采购平台</h1>
          <p>Archaeological Equipment Procurement Platform</p>
        </div>
      </div>

      <nav class="nav-menu">
        <router-link to="/" class="nav-item" active-class="active">首页</router-link>
        <router-link to="/packages" class="nav-item" active-class="active">采购套餐</router-link>
        <div class="nav-item category-dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
          <span>器材分类 <el-icon><ArrowDown /></el-icon></span>
          <div v-show="showDropdown" class="dropdown-menu">
            <router-link 
              v-for="cat in categories" 
              :key="cat.id" 
              :to="`/category/${cat.id}`"
              class="dropdown-item"
            >
              <el-icon><component :is="cat.icon" /></el-icon>
              <span>{{ cat.name }}</span>
            </router-link>
          </div>
        </div>
      </nav>

      <div class="header-right">
        <template v-if="userStore.isLoggedIn">
          <div class="user-menu" @mouseenter="showUserMenu = true" @mouseleave="showUserMenu = false">
            <el-avatar :src="userStore.user.avatar" :size="36" />
            <span class="username">{{ userStore.user.name }}</span>
            <el-tag v-if="userStore.isSupplier" type="warning" size="small">供货商</el-tag>
            <el-tag v-else type="success" size="small">采购方</el-tag>
            <div v-show="showUserMenu" class="user-dropdown">
              <router-link to="/center" class="dropdown-item">
                <el-icon><User /></el-icon>个人中心
              </router-link>
              <router-link to="/orders" class="dropdown-item">
                <el-icon><List /></el-icon>我的订单
              </router-link>
              <router-link to="/favorites" class="dropdown-item">
                <el-icon><Star /></el-icon>我的收藏
              </router-link>
              <router-link v-if="userStore.isSupplier" to="/supplier" class="dropdown-item">
                <el-icon><OfficeBuilding /></el-icon>供货商中心
              </router-link>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item logout" @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="login-btn">
            <el-button type="primary">登录 / 注册</el-button>
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { categories } from '@/mock/data'

const router = useRouter()
const userStore = useUserStore()
const showDropdown = ref(false)
const showUserMenu = ref(false)

const goHome = () => {
  router.push('/')
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style lang="scss" scoped>
.app-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
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
  gap: 12px;
  cursor: pointer;

  .logo-text {
    h1 {
      font-size: 20px;
      color: #d4af37;
      margin: 0;
      font-weight: 600;
      letter-spacing: 1px;
    }
    p {
      font-size: 11px;
      color: #909399;
      margin: 2px 0 0 0;
      letter-spacing: 0.5px;
    }
  }
}

.nav-menu {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;

  .nav-item {
    padding: 8px 20px;
    color: #e0e0e0;
    font-size: 15px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 4px;
    position: relative;

    &:hover {
      color: #d4af37;
      background: rgba(212, 175, 55, 0.1);
    }

    &.active {
      color: #d4af37;
      background: rgba(212, 175, 55, 0.15);
    }
  }

  .category-dropdown:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 8px 0;
    min-width: 200px;
    margin-top: 8px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: all 0.3s;
    z-index: 1001;

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      color: #333;
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        background: #f5f7fa;
        color: #d4af37;
      }

      .el-icon {
        font-size: 18px;
      }
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;

  .user-menu {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 12px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.1);
    cursor: pointer;
    position: relative;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .username {
      color: #fff;
      font-size: 14px;
    }

    .user-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 8px 0;
      min-width: 160px;
      margin-top: 8px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: all 0.3s;
      z-index: 1001;

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        color: #333;
        font-size: 14px;
        transition: all 0.2s;

        &:hover {
          background: #f5f7fa;
          color: #d4af37;
        }

        &.logout {
          color: #e74c3c;
        }
      }

      .dropdown-divider {
        height: 1px;
        background: #ebeef5;
        margin: 4px 0;
      }
    }

    &:hover .user-dropdown {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }
}
</style>
