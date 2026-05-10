<script setup lang="ts">
import { ref, computed } from 'vue'
import CategoryManagement from './components/CategoryManagement.vue'
import EquipmentManagement from './components/EquipmentManagement.vue'
import RentalManagement from './components/RentalManagement.vue'
import OperationLogs from './components/OperationLogs.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import { useDataStore } from './composables/useDataStore'

const { equipments, operationLogs, agingWarningEquipments } = useDataStore()

const activeMenu = ref('equipment')
const sidebarOpen = ref(false)

const menuItems = [
  { key: 'equipment', label: '装备管理', icon: '🏕️' },
  { key: 'category', label: '分类管理', icon: '📁' },
  { key: 'rental', label: '租赁管理', icon: '📦' },
  { key: 'logs', label: '操作日志', icon: '📋' }
]

const currentPageTitle = computed(() => {
  const item = menuItems.find(m => m.key === activeMenu.value)
  return item ? item.label : ''
})

const warningCount = computed(() => agingWarningEquipments.value.length)

const selectMenu = (key: string) => {
  activeMenu.value = key
  sidebarOpen.value = false
}

const closeSidebar = () => {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="app-layout">
    <div 
      class="sidebar-overlay" 
      :class="{ open: sidebarOpen }"
      @click="closeSidebar"
    ></div>
    
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <h1 class="sidebar-title">🏕️ 装备管理系统</h1>
        <p class="sidebar-subtitle">户外装备库存管理</p>
      </div>
      
      <nav class="nav-menu">
        <div
          v-for="item in menuItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: activeMenu === item.key }"
          @click="selectMenu(item.key)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <span 
            v-if="item.key === 'rental' && warningCount > 0" 
            class="badge badge-info"
            style="margin-left: auto;"
          >
            {{ warningCount }}
          </span>
        </div>
      </nav>
      
      <div class="sidebar-header" style="border-top: 1px solid #334155; border-bottom: none;">
        <p class="sidebar-subtitle" style="margin: 0;">
          装备总数：{{ equipments.length }}
        </p>
        <p class="sidebar-subtitle" style="margin: 4px 0 0 0;">
          操作记录：{{ operationLogs.length }}
        </p>
      </div>
    </aside>
    
    <main class="main-content">
      <header class="top-header">
        <div style="display: flex; align-items: center; gap: 16px;">
          <button class="mobile-menu-btn" @click="sidebarOpen = !sidebarOpen">
            ☰
          </button>
          <h2 class="page-title">{{ currentPageTitle }}</h2>
        </div>
        
        <div class="header-actions">
          <div class="user-info">
            <span>👤</span>
            <span>系统管理员</span>
          </div>
        </div>
      </header>
      
      <div class="content-area">
        <CategoryManagement v-if="activeMenu === 'category'" />
        <EquipmentManagement v-else-if="activeMenu === 'equipment'" />
        <RentalManagement v-else-if="activeMenu === 'rental'" />
        <OperationLogs v-else-if="activeMenu === 'logs'" />
      </div>
    </main>
    
    <NotificationContainer />
  </div>
</template>
