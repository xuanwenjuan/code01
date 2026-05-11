<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMedicineStore } from '@/stores/medicine'
import { useReminderStore } from '@/stores/reminder'
import { useLogStore } from '@/stores/log'

const route = useRoute()
const router = useRouter()
const medicineStore = useMedicineStore()
const reminderStore = useReminderStore()
const logStore = useLogStore()

const isCollapsed = ref(false)
const activeMenu = computed(() => route.path)
const currentTitle = computed(() => (route.meta.title as string) || '')

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function handleMenuSelect(index: string) {
  router.push(index)
}

onMounted(() => {
  medicineStore.initMedicines()
  reminderStore.initReminders()
  logStore.initLogs()
  reminderStore.checkMissedReminders()
})
</script>

<template>
  <div class="app-container">
    <el-container class="main-container">
      <el-aside :width="isCollapsed ? '64px' : '220px'" class="sidebar">
        <div class="logo">
          <el-icon><MedicineBox /></el-icon>
          <span v-show="!isCollapsed">智能药箱</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapsed"
          :collapse-transition="false"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/medicine">
            <el-icon><MedicineBox /></el-icon>
            <template #title>药品管理</template>
          </el-menu-item>
          <el-menu-item index="/reminder">
            <el-icon><AlarmClock /></el-icon>
            <template #title>用药管理</template>
          </el-menu-item>
          <el-menu-item index="/logs">
            <el-icon><Document /></el-icon>
            <template #title>操作日志</template>
          </el-menu-item>
        </el-menu>
        <div class="collapse-btn" @click="toggleCollapse">
          <el-icon :size="20">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
        </div>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="user-info">
            <el-avatar :size="32" icon="UserFilled" />
            <span class="user-name">管理员</span>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
