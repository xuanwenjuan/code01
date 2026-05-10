<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isSidebarOpen = ref(true)

const navItems = [
  { path: '/', icon: '📊', label: '库存概览' },
  { path: '/categories', icon: '📁', label: '分类管理' },
  { path: '/food-items', icon: '🥬', label: '食材管理' },
  { path: '/operations', icon: '📦', label: '出入库管理' },
  { path: '/logs', icon: '📝', label: '操作日志' }
]

const currentRoute = computed(() => route.path)
</script>

<template>
  <div class="layout">
    <aside class="sidebar" :class="{ open: isSidebarOpen }">
      <div class="sidebar-header">
        <div class="sidebar-title">🍎 生鲜库存</div>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="sidebar-nav-item"
          :class="{ active: currentRoute === item.path }"
        >
          <span class="sidebar-nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>
