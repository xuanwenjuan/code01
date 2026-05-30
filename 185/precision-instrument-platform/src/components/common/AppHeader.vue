<template>
  <header class="app-header">
    <div class="header-top">
      <div class="container">
        <div class="header-top-content">
          <span class="welcome-text">欢迎访问精密仪器配件采购平台</span>
          <div class="user-actions">
            <template v-if="userStore.isLoggedIn">
              <span class="user-name">
                <el-icon><User /></el-icon>
                {{ userStore.userInfo.name }}
                <el-tag :type="userStore.userInfo.role === 'buyer' ? 'primary' : 'success'" size="small" style="margin-left: 8px">
                  {{ userStore.userInfo.role === 'buyer' ? '采购用户' : '仪器商家' }}
                </el-tag>
              </span>
              <el-link type="primary" @click="goToProfile">个人中心</el-link>
              <el-link type="primary" @click="goToOrders">我的订单</el-link>
              <el-link type="primary" @click="goToFavorites">我的收藏</el-link>
              <el-link type="danger" @click="handleLogout">退出登录</el-link>
            </template>
            <template v-else>
              <el-link type="primary" @click="goToLogin">请登录</el-link>
              <el-link type="primary">免费注册</el-link>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="header-main">
      <div class="container">
        <div class="header-content">
          <div class="logo" @click="goHome">
            <el-icon :size="36" color="#409eff"><Tools /></el-icon>
            <div class="logo-text">
              <h1>精密仪器配件平台</h1>
              <p>Precision Instrument Parts</p>
            </div>
          </div>
          <div class="search-bar">
            <el-input
              v-model="searchText"
              placeholder="搜索精密配件、光学元件、传感器..."
              size="large"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button type="primary" @click="handleSearch">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
              </template>
            </el-input>
          </div>
          <div class="header-right">
            <div class="cart-icon" @click="goToOrders">
              <el-badge :value="3" class="item">
                <el-icon :size="28"><ShoppingCart /></el-icon>
              </el-badge>
              <span>采购订单</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="header-nav">
      <div class="container">
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          router
          class="nav-menu"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>平台首页</span>
          </el-menu-item>
          <el-menu-item index="/category">
            <el-icon><Grid /></el-icon>
            <span>全部配件</span>
          </el-menu-item>
          <el-sub-menu index="categories" v-if="userStore.isLoggedIn">
            <template #title>
              <el-icon><Menu /></el-icon>
              <span>快捷入口</span>
            </template>
            <el-menu-item index="/orders">我的订单</el-menu-item>
            <el-menu-item index="/favorites">我的收藏</el-menu-item>
            <el-menu-item index="/profile">个人中心</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { ElMessage } from 'element-plus'
import {
  User, Search, ShoppingCart, HomeFilled, Grid, Menu, Tools
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()

const searchText = ref('')

const activeMenu = computed(() => route.path)

const handleSearch = () => {
  productStore.setSearchKeyword(searchText.value)
  router.push('/category')
}

const goHome = () => router.push('/')
const goToLogin = () => router.push('/login')
const goToProfile = () => router.push('/profile')
const goToOrders = () => router.push('/orders')
const goToFavorites = () => router.push('/favorites')

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style scoped>
.app-header {
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.header-top {
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 8px 0;
}

.header-top-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #606266;
}

.welcome-text {
  color: #909399;
}

.user-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-main {
  padding: 20px 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-text h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  letter-spacing: 1px;
}

.logo-text p {
  margin: 0;
  font-size: 12px;
  color: #909399;
  letter-spacing: 1px;
}

.search-bar {
  flex: 1;
  max-width: 600px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.cart-icon:hover {
  color: #409eff;
}

.cart-icon span {
  font-size: 12px;
  margin-top: 4px;
}

.header-nav {
  background: #409eff;
}

.nav-menu {
  border-bottom: none;
  background: #409eff;
}

.nav-menu .el-menu-item,
.nav-menu .el-sub-menu__title {
  color: #fff;
  border-bottom: none;
  height: 50px;
  line-height: 50px;
}

.nav-menu .el-menu-item:hover,
.nav-menu .el-sub-menu__title:hover {
  background: #66b1ff;
}

.nav-menu .el-menu-item.is-active {
  background: #66b1ff;
  color: #fff;
}

.nav-menu .el-menu-item i,
.nav-menu .el-sub-menu__title i {
  margin-right: 6px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>
