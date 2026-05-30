<script setup lang="ts">
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()
</script>

<template>
  <div id="app">
    <el-container class="layout-container">
      <el-aside :width="appStore.sidebarWidth + 'px'" class="sidebar">
        <div class="logo">
          <h2>智能家居经销后台</h2>
        </div>
        <el-menu
          :default-active="appStore.currentRoute"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/category">
            <el-icon><Grid /></el-icon>
            <span>设备分类管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory">
            <el-icon><Box /></el-icon>
            <span>设备库存管理</span>
          </el-menu-item>
          <el-menu-item index="/dealer">
            <el-icon><User /></el-icon>
            <span>渠道经销商管理</span>
          </el-menu-item>
          <el-menu-item index="/order">
            <el-icon><Document /></el-icon>
            <span>销售订单管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-button
              :icon="appStore.isCollapse ? 'Expand' : 'Fold'"
              @click="appStore.toggleSidebar"
              circle
            />
          </div>
          <div class="header-right">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" icon="UserFilled" />
                <span class="username">管理员</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b2f3a;

    h2 {
      color: #fff;
      font-size: 16px;
      margin: 0;
    }
  }

  .el-menu {
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

  &-left, &-right {
    display: flex;
    align-items: center;
  }

  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;

    .username {
      margin-left: 8px;
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
