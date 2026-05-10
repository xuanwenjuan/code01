<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo">
        <el-icon v-if="isCollapse"><Plus /></el-icon>
        <span v-else class="logo-text">医院管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">{{ systemStore.currentUser.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Fold,
  Expand,
  ArrowDown,
  User,
  UserFilled,
  SwitchButton,
  Plus,
  DataLine,
  OfficeBuilding,
  Tickets,
  Monitor,
  Document,
  Notebook
} from '@element-plus/icons-vue'
import { useSystemStore } from '@/stores/system'

interface MenuItem {
  path: string
  title: string
  icon: string
}

const router = useRouter()
const route = useRoute()
const systemStore = useSystemStore()

const isCollapse = ref(false)

const menuItems: MenuItem[] = [
  { path: '/dashboard', title: '数据概览', icon: 'DataLine' },
  { path: '/departments', title: '科室管理', icon: 'OfficeBuilding' },
  { path: '/doctors', title: '医生管理', icon: 'UserFilled' },
  { path: '/registrations', title: '挂号管理', icon: 'Tickets' },
  { path: '/clinic', title: '就诊管理', icon: 'Monitor' },
  { path: '/prescriptions', title: '处方管理', icon: 'Document' },
  { path: '/audit', title: '操作审计', icon: 'Notebook' }
]

const activeMenu = computed(() => route.path)

const currentPageTitle = computed(() => {
  const item = menuItems.find(m => m.path === route.path)
  return item?.title || '首页'
})

function toggleCollapse() {
  isCollapse.value = !isCollapse.value
}

onMounted(() => {
  systemStore.fetchDepartments()
  systemStore.fetchDoctors()
})
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    background-color: #2b3a4a;
    border-bottom: 1px solid #1f2d3d;

    .logo-text {
      margin-left: 8px;
    }
  }

  :deep(.el-menu) {
    border-right: none;
  }
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 24px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: #606266;
      transition: color 0.3s;

      &:hover {
        color: #409eff;
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .username {
        font-weight: 500;
        color: #303133;
      }
    }
  }
}

.layout-main {
  background-color: #f5f7fa;
  padding: 20px;
  overflow: auto;
}
</style>
