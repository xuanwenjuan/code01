<template>
  <div class="app-container">
    <el-container class="main-container">
      <el-aside :width="isMobile ? '0px' : '220px'" class="sidebar">
        <div class="logo">
          <span class="logo-icon">🏪</span>
          <span class="logo-text">智慧校园便利店</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          class="sidebar-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/products">
            <el-icon><ShoppingBag /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/categories">
            <el-icon><Folder /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory">
            <el-icon><Box /></el-icon>
            <span>库存管理</span>
          </el-menu-item>
          <el-menu-item index="/logs">
            <el-icon><Document /></el-icon>
            <span>操作日志</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-button v-if="isMobile" type="primary" link @click="toggleMobileMenu">
              <el-icon><Menu /></el-icon>
            </el-button>
            <span class="page-title">{{ currentPageTitle }}</span>
          </div>
          <div class="header-right">
            <span class="user-info">系统管理员</span>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    <el-drawer
      v-model="mobileMenuVisible"
      direction="ltr"
      size="80%"
      :with-header="false"
    >
      <div class="mobile-menu">
        <div class="mobile-logo">
          <span class="logo-icon">🏪</span>
          <span class="logo-text">智慧校园便利店</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          class="mobile-menu-list"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          @select="mobileMenuVisible = false"
        >
          <el-menu-item index="/products">
            <el-icon><ShoppingBag /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/categories">
            <el-icon><Folder /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory">
            <el-icon><Box /></el-icon>
            <span>库存管理</span>
          </el-menu-item>
          <el-menu-item index="/logs">
            <el-icon><Document /></el-icon>
            <span>操作日志</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ShoppingBag, Folder, Box, Document, Menu } from '@element-plus/icons-vue'

const route = useRoute()
const isMobile = ref(false)
const mobileMenuVisible = ref(false)

const activeMenu = computed(() => route.path)
const currentPageTitle = computed(() => (route.meta.title as string) || '首页')

function checkMobile(): void {
  isMobile.value = window.innerWidth < 768
}

function toggleMobileMenu(): void {
  mobileMenuVisible.value = !mobileMenuVisible.value
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.main-container {
  height: 100%;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .logo-icon {
      font-size: 24px;
      margin-right: 8px;
    }
  }

  .sidebar-menu {
    border-right: none;
  }
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .page-title {
    font-size: 18px;
    font-weight: 500;
  }

  .user-info {
    color: #606266;
  }
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

.mobile-menu {
  height: 100%;
  background-color: #304156;

  .mobile-logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .logo-icon {
      font-size: 24px;
      margin-right: 8px;
    }
  }

  .mobile-menu-list {
    border-right: none;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }

  .page-title {
    font-size: 16px;
  }

  :deep(.el-main) {
    padding: 12px;
  }
}
</style>
