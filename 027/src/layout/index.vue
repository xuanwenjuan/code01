<template>
  <el-container class="layout-container">
    <el-aside 
      :width="sidebarWidth" 
      class="layout-aside"
      :class="{ 'is-mobile': isMobile }"
    >
      <div class="logo">
        <el-icon v-if="isCollapse || isMobile"><Plus /></el-icon>
        <span v-else class="logo-text">医院管理系统</span>
        <el-icon 
          v-if="isMobile" 
          class="mobile-close" 
          @click="isMobile = false"
        >
          <Close />
        </el-icon>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse && !isMobile"
        :collapse-transition="false"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        @select="handleMenuSelect"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <div 
      v-if="isMobile" 
      class="sidebar-overlay"
      @click="isMobile = false"
    />

    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon 
            v-if="isMobile" 
            class="collapse-btn" 
            @click="isMobile = true"
          >
            <Menu />
          </el-icon>
          <el-icon 
            v-else 
            class="collapse-btn" 
            @click="toggleCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="28" icon="UserFilled" />
              <span class="username">{{ systemStore.currentUser.name }}</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item divided>
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
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
import { useRouter, useRoute } from 'vue-router'
import {
  Fold,
  Expand,
  ArrowDown,
  User,
  UserFilled,
  SwitchButton,
  Plus,
  Menu,
  Close,
  DataLine,
  OfficeBuilding,
  Tickets,
  Monitor,
  Document,
  Notebook
} from '@element-plus/icons-vue'
import { useSystemStore } from '@/stores/system'
import { useAuditStore } from '@/stores/audit'

interface MenuItem {
  path: string
  title: string
  icon: string
}

const router = useRouter()
const route = useRoute()
const systemStore = useSystemStore()
const auditStore = useAuditStore()

const isCollapse = ref(false)
const isMobile = ref(false)

const menuItems: MenuItem[] = [
  { path: '/dashboard', title: '数据概览', icon: 'DataLine' },
  { path: '/departments', title: '科室管理', icon: 'OfficeBuilding' },
  { path: '/doctors', title: '医生管理', icon: 'UserFilled' },
  { path: '/registrations', title: '挂号管理', icon: 'Tickets' },
  { path: '/clinic', title: '就诊管理', icon: 'Monitor' },
  { path: '/prescriptions', title: '处方管理', icon: 'Document' },
  { path: '/audit', title: '操作审计', icon: 'Notebook' }
]

const sidebarWidth = computed(() => {
  if (isMobile.value) return '220px'
  return isCollapse.value ? '64px' : '220px'
})

const activeMenu = computed(() => route.path)

const currentPageTitle = computed(() => {
  const item = menuItems.find(m => m.path === route.path)
  return item?.title || '首页'
})

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isMobile.value = false
  }
}

function toggleCollapse() {
  isCollapse.value = !isCollapse.value
}

function handleMenuSelect() {
  if (isMobile.value) {
    isMobile.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  systemStore.fetchDepartments()
  systemStore.fetchDoctors()
  auditStore.fetchLogs()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  min-height: 100vh;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s ease, transform 0.3s ease;
  overflow: hidden;
  z-index: 1000;

  &.is-mobile {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(0);
  }

  &.is-mobile:not(.is-visible) {
    transform: translateX(-100%);
  }

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    background-color: #2b3a4a;
    border-bottom: 1px solid #1f2d3d;

    .logo-text {
      margin-left: 8px;
      flex: 1;
    }

    .mobile-close {
      font-size: 20px;
      cursor: pointer;
      padding: 4px;

      &:hover {
        color: #409eff;
      }
    }
  }

  :deep(.el-menu) {
    border-right: none;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 16px;
  height: 60px;
  flex-shrink: 0;

  @media (min-width: 768px) {
    padding: 0 24px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: #606266;
      transition: color 0.3s;
      flex-shrink: 0;

      &:hover {
        color: #409eff;
      }
    }

    .breadcrumb {
      min-width: 0;
      flex-shrink: 1;
    }
  }

  .header-right {
    flex-shrink: 0;

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .username {
        font-weight: 500;
        color: #303133;
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        @media (min-width: 768px) {
          max-width: none;
        }
      }

      .arrow-icon {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.layout-main {
  background-color: #f5f7fa;
  padding: 12px;
  overflow: auto;
  flex: 1;

  @media (min-width: 768px) {
    padding: 20px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
