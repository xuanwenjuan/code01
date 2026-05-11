<template>
  <el-container class="layout-container">
    <el-aside :width="sidebarWidth" class="aside" :class="{ 'is-collapsed': collapsed }">
      <div class="logo">
        <el-icon class="logo-icon"><Warehouse /></el-icon>
        <span v-show="!collapsed" class="logo-text">仓储管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        router
        class="menu"
        background-color="#001529"
        text-color="rgba(255,255,255,0.65)"
        active-text-color="#1890ff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>工作台</template>
        </el-menu-item>
        <el-menu-item index="/warehouse">
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>仓库与货位</template>
        </el-menu-item>
        <el-menu-item index="/inventory">
          <el-icon><Box /></el-icon>
          <template #title>库存管理</template>
        </el-menu-item>
        <el-menu-item index="/inbound">
          <el-icon><Download /></el-icon>
          <template #title>入库管理</template>
        </el-menu-item>
        <el-menu-item index="/outbound">
          <el-icon><Upload /></el-icon>
          <template #title>出库管理</template>
        </el-menu-item>
        <el-menu-item index="/logs">
          <el-icon><Document /></el-icon>
          <template #title>操作履历</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="handleToggleSidebar">
            <Fold v-if="!collapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRouteName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">陈经理</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Warehouse,
  DataAnalysis,
  OfficeBuilding,
  Box,
  Download,
  Upload,
  Document,
  Fold,
  Expand,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()

const SIDEBAR_WIDTH = 220
const SIDEBAR_COLLAPSED_WIDTH = 64
const MIN_WINDOW_WIDTH = 1024

const collapsed = ref(false)
const windowWidth = ref(window.innerWidth)

const activeMenu = computed(() => route.path)
const currentRouteName = computed(() => (route.meta.title as string) || '工作台')

const sidebarWidth = computed(() => {
  if (windowWidth.value < MIN_WINDOW_WIDTH) {
    return collapsed.value ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_WIDTH}px`
  }
  return collapsed.value ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_WIDTH}px`
})

const handleToggleSidebar = () => {
  collapsed.value = !collapsed.value
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  if (windowWidth.value < MIN_WINDOW_WIDTH && !collapsed.value) {
    collapsed.value = true
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  min-width: 768px;
}

.aside {
  background-color: #001529;
  transition: width 0.3s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.aside.is-collapsed {
  width: 64px !important;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
  overflow: hidden;
}

.logo-icon {
  font-size: 28px;
  color: #1890ff;
  flex-shrink: 0;
}

.logo-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu {
  border-right: none;
  height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
}

.header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  height: 60px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 0;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
  flex-shrink: 0;
}

.collapse-btn:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow: auto;
  min-width: 0;
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {
  .username {
    display: none;
  }
}

@media (max-width: 1024px) {
  .header {
    padding: 0 12px;
  }

  .header-left {
    gap: 12px;
  }

  .main {
    padding: 12px;
  }
}
</style>
