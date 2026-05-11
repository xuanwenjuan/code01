<template>
  <el-container class="app-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <el-icon :size="32" color="#409eff"><Dumbbell /></el-icon>
        <span class="logo-text">健身管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :index="route.path"
        >
          <el-icon>
            <component :is="route.meta.icon" />
          </el-icon>
          <template #title>{{ route.meta.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRouteTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">{{ currentUser.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const route = useRoute()
const currentUser = window.currentUser

const menuRoutes = computed<RouteRecordRaw[]>(() => {
  return [
    { path: '/dashboard', meta: { title: '首页', icon: 'HomeFilled' } },
    { path: '/members', meta: { title: '会员管理', icon: 'User' } },
    { path: '/cards', meta: { title: '卡种管理', icon: 'Tickets' } },
    { path: '/appointments', meta: { title: '预约管理', icon: 'Calendar' } },
    { path: '/courses', meta: { title: '课程管理', icon: 'Reading' } },
    { path: '/logs', meta: { title: '操作日志', icon: 'Document' } },
  ] as RouteRecordRaw[]
})

const activeMenu = computed(() => route.path)
const currentRouteTitle = computed(() => {
  const found = menuRoutes.value.find((r) => r.path === route.path)
  return found ? (found.meta.title as string) : ''
})

const handleCommand = (command: string) => {
  ElMessage.info(`点击了 ${command}`)
}
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #2b2f3a;
}

.logo-text {
  margin-left: 12px;
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  color: #333;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
