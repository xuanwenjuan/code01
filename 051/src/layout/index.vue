<template>
  <div class="layout-container">
    <aside :class="['sidebar', { collapsed: sidebarCollapsed }]">
      <div class="logo">
        <el-icon v-if="sidebarCollapsed" :size="28" color="#fff"><Grape /></el-icon>
        <span v-else>高端红酒管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="sidebarCollapsed"
        background-color="#8B4513"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>工作台</template>
        </el-menu-item>
        <el-menu-item index="/wine-brand">
          <el-icon><Grape /></el-icon>
          <template #title>酒水品牌品类</template>
        </el-menu-item>
        <el-menu-item index="/supplier">
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>供应商渠道</template>
        </el-menu-item>
        <el-menu-item index="/purchase">
          <el-icon><ShoppingCart /></el-icon>
          <template #title>采购入库单据</template>
        </el-menu-item>
        <el-menu-item index="/inventory">
          <el-icon><Box /></el-icon>
          <template #title>库存与出库</template>
        </el-menu-item>
      </el-menu>
    </aside>

    <div class="main-container">
      <header class="header">
        <div class="header-left">
          <el-button :icon="Fold" circle @click="toggleSidebar" />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-avatar :size="32" icon="UserFilled" />
          <span class="username">管理员</span>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Fold, Grape, DataBoard, OfficeBuilding, ShoppingCart, Box } from '@element-plus/icons-vue'
import { useAppStore } from '@/store'

const route = useRoute()
const appStore = useAppStore()

const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const activeMenu = computed(() => route.path)
const currentPageTitle = computed(() => route.meta.title as string)

const toggleSidebar = () => {
  appStore.toggleSidebar()
}
</script>

<style scoped lang="scss">
.layout-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.sidebar {
  width: $sidebar-width;
  height: 100%;
  background: $primary-color;
  transition: width 0.3s;
  overflow: hidden;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }

  .logo {
    height: $header-height;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .el-menu {
    border-right: none;
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: $header-height;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  &-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .username {
    color: #303133;
    font-size: 14px;
  }
}

.content {
  flex: 1;
  background: #f5f7fa;
  overflow-y: auto;
}

@media (max-width: $breakpoint-tablet) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 999;

    &:not(.collapsed) {
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
