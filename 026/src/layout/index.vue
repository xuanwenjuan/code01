<template>
  <div class="layout-container">
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: #fff; font-size: 18px; margin: 0;">
          {{ isCollapsed ? 'OA' : '办公管理系统' }}
        </h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#ffffff"
        router
      >
        <el-menu-item v-for="route in menuRoutes" :key="route.path" :index="route.path">
          <el-icon><component :is="route.meta?.icon" /></el-icon>
          <template #title>{{ route.meta?.title }}</template>
        </el-menu-item>
      </el-menu>
    </aside>
    
    <div class="main-container">
      <header class="header">
        <el-icon class="collapse-btn" @click="isCollapsed = !isCollapsed">
          <Fold v-if="!isCollapsed" />
          <Expand v-else />
        </el-icon>
        <div>
          <el-dropdown>
            <span style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <el-avatar icon="UserFilled" :size="32" />
              <span>系统管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const route = useRoute()
const isCollapsed = ref(false)

const menuRoutes = computed(() => {
  const routes = route.matched[0]?.children || []
  return routes.filter((r) => r.meta?.title) as Array<RouteRecordRaw & { meta: { title: string; icon: string } }>
})

const activeMenu = computed(() => route.path)
</script>

<style scoped>
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.collapse-btn:hover {
  color: #409eff;
}
</style>