<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

interface MenuItem {
  path: string
  title: string
  icon: string
}

const props = defineProps<{
  collapsed?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-collapse', collapsed: boolean): void
}>()

const isCollapsed = ref<boolean>(props.collapsed || false)
const isMobile = ref<boolean>(false)
const isMobileSidebarOpen = ref<boolean>(false)
const router = useRouter()
const route = useRoute()

const menuItems: MenuItem[] = [
  { path: '/dashboard', title: '概览', icon: 'DataBoard' },
  { path: '/books', title: '书籍管理', icon: 'Reading' },
  { path: '/bookshelf', title: '我的书架', icon: 'Collection' },
  { path: '/reading', title: '阅读进度', icon: 'Clock' },
  { path: '/logs', title: '操作履历', icon: 'Document' }
]

const activeMenu = computed<string>(() => route.path)

const routeTitle = computed<string>(() => {
  const current = menuItems.find((item: MenuItem) => item.path === route.path)
  return current?.title || '概览'
})

const checkMobile = (): void => {
  isMobile.value = window.innerWidth < BREAKPOINT_MD
  if (!isMobile.value) {
    isMobileSidebarOpen.value = false
  }
}

const handleResize = (): void => {
  checkMobile()
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const toggleCollapse = (): void => {
  if (isMobile.value) {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value
  } else {
    isCollapsed.value = !isCollapsed.value
    emit('toggle-collapse', isCollapsed.value)
  }
}

const handleSelect = (index: string): void => {
  router.push(index)
  if (isMobile.value) {
    isMobileSidebarOpen.value = false
  }
}

const handleOverlayClick = (): void => {
  isMobileSidebarOpen.value = false
}

const sidebarWidth = computed<string>(() => {
  if (isMobile.value) {
    return isMobileSidebarOpen.value ? SIDEBAR_WIDTH : '0px'
  }
  return isCollapsed.value ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH
})
</script>

<template>
  <el-container class="app-container">
    <el-aside 
      :width="sidebarWidth" 
      class="sidebar"
      :class="{ 'is-mobile': isMobile, 'is-open': isMobileSidebarOpen }"
    >
      <div class="logo">
        <el-icon v-if="isCollapsed && !isMobile"><Reading /></el-icon>
        <span v-else>个人阅读管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed && !isMobile"
        :collapse-transition="false"
        class="menu"
        @select="handleSelect"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <div 
      v-if="isMobile && isMobileSidebarOpen" 
      class="sidebar-overlay"
      @click="handleOverlayClick"
    />

    <el-container class="main-container">
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Menu v-if="isMobile" />
            <Fold v-else-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ routeTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-button type="primary" icon="Plus" circle class="add-btn" />
          <el-avatar icon="User" class="user-avatar" />
        </div>
      </el-header>

      <el-main class="main-content">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
const BREAKPOINT_MD: number = 768
const SIDEBAR_WIDTH: string = '220px'
const SIDEBAR_COLLAPSED_WIDTH: string = '64px'
</script>

<style scoped lang="scss">
.app-container {
  height: 100vh;
  background-color: $bg-color;
  position: relative;
}

.sidebar {
  background-color: #1f2d3d;
  transition: width $transition-normal;
  overflow: hidden;
  flex-shrink: 0;
  z-index: $z-index-sidebar;

  &.is-mobile {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform $transition-normal;
    width: $sidebar-width !important;

    &.is-open {
      transform: translateX(0);
    }
  }

  .logo {
    height: $header-height;
    @include flex-center;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0 15px;

    .el-icon {
      font-size: 28px;
    }

    span {
      @include text-ellipsis;
    }
  }

  .menu {
    background-color: #1f2d3d;
    border-right: none;
    height: calc(100vh - #{$header-height});
    overflow-y: auto;

    :deep(.el-menu-item) {
      color: #bfcbd9;

      &:hover {
        background-color: #263445;
      }

      &.is-active {
        background-color: $primary-color;
        color: #fff;
      }
    }
  }
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: calc(#{$z-index-sidebar} - 1);
}

.main-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  height: $header-height;
  flex-shrink: 0;
  z-index: $z-index-header;

  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
    min-width: 0;
    flex: 1;
  }

  .collapse-btn {
    cursor: pointer;
    font-size: 20px;
    color: $text-regular;
    transition: color $transition-fast;
    flex-shrink: 0;

    &:hover {
      color: $primary-color;
    }
  }

  .breadcrumb {
    min-width: 0;
    overflow: hidden;

    :deep(.el-breadcrumb__item) {
      @include text-ellipsis;
      max-width: 150px;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-shrink: 0;
  }

  .add-btn {
    @include respond-to-max('md') {
      display: none;
    }
  }

  .user-avatar {
    cursor: pointer;
  }
}

.main-content {
  padding: 20px;
  background-color: $bg-color;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

@include respond-to-max('md') {
  .header {
    padding: 0 15px;
  }

  .main-content {
    padding: 15px;
  }

  .sidebar {
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }
}

@include respond-to-max('sm') {
  .header {
    padding: 0 10px;
  }

  .main-content {
    padding: 10px;
  }

  .header-left .breadcrumb {
    display: none;
  }
}
</style>
