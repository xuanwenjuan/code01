<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHospitalStore } from '@/stores/hospital'
import {
  DataAnalysis,
  User,
  Calendar,
  Tickets,
  Document,
  Menu,
  Fold,
  Expand
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const store = useHospitalStore()

const isCollapse = ref(false)

const menuItems = [
  { path: '/dashboard', label: '数据看板', icon: DataAnalysis },
  { path: '/doctors', label: '科室医生管理', icon: User },
  { path: '/schedule', label: '排班管理', icon: Calendar },
  { path: '/registration', label: '挂号管理', icon: Tickets },
  { path: '/logs', label: '操作日志', icon: Document }
]

onMounted(() => {
  store.init()
})

const handleMenuSelect = (path: string) => {
  router.push(path)
}
</script>

<template>
  <el-container class="app-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="app-aside">
      <div class="logo">
        <el-icon size="32" color="#409EFF"><DataAnalysis /></el-icon>
        <span v-if="!isCollapse" class="logo-text">智慧医院</span>
      </div>
      <el-menu
        :default-active="route.path"
        :collapse="isCollapse"
        class="app-menu"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        @select="handleMenuSelect"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.label }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <el-button text @click="isCollapse = !isCollapse">
            <el-icon><component :is="isCollapse ? Expand : Fold" /></el-icon>
          </el-button>
          <span class="title">智慧医院门诊挂号与排班管理系统</span>
        </div>
        <div class="header-right">
          <el-tag type="info">当前用户：管理员</el-tag>
        </div>
      </el-header>
      
      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
}

.app-aside {
  background-color: #001529;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  border-bottom: 1px solid #1f2f41;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
}

.app-menu {
  flex: 1;
  border-right: none;
}

.app-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.app-main {
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
