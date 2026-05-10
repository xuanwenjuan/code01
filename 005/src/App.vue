<template>
  <div class="app">
    <header class="app-header">
      <div class="container flex-between">
      <div class="flex-center" style="gap: 15px;">
        <div class="app-logo">🌿</div>
        <div>
          <h1 class="app-title">传统中医药材标本归档管理系统</h1>
          <div class="app-subtitle">Traditional Chinese Medicine Specimen Management System</div>
        </div>
      </div>
      <div class="app-user">
        <span>系统管理员</span>
      </div>
    </div>
    </header>

    <main class="app-main">
      <div class="container">
        <nav class="app-nav">
          <button
            v-for="item in menuItems"
            :key="item.id"
            :class="['nav-item', { active: currentView === item.id }]"
            @click="currentView = item.id"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
            <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
          </button>
        </nav>

        <div class="app-content">
          <Transition name="fade" mode="out-in">
            <component
              :is="currentComponent"
              :key="currentView"
            />
          </Transition>
        </div>
      </div>
      </div>
    </main>

    <Toast />
    <ConfirmModal />
    <AlertModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSpecimenStore } from './stores/specimen'
import { useCategoryStore } from './stores/category'
import { useBorrowStore } from './stores/borrow'
import { useMaintenanceStore } from './stores/maintenance'
import { useLogStore } from './stores/log'
import Dashboard from './views/Dashboard.vue'
import CategoryList from './views/categories/CategoryList.vue'
import SpecimenList from './views/specimens/SpecimenList.vue'
import BorrowMaintenance from './views/borrow/BorrowMaintenance.vue'
import LogList from './views/logs/LogList.vue'
import Toast from './components/Toast.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import AlertModal from './components/AlertModal.vue'

const specimenStore = useSpecimenStore()
const categoryStore = useCategoryStore()
const borrowStore = useBorrowStore()
const maintenanceStore = useMaintenanceStore()
const logStore = useLogStore()

const currentView = ref('dashboard')

const menuItems = computed(() => [
  { id: 'dashboard', label: '仪表板', icon: '📊' },
  { id: 'categories', label: '分类管理', icon: '📁' },
  { id: 'specimens', label: '标本管理', icon: '📦' },
  { id: 'borrow', label: '借阅与养护', icon: '📋', badge: borrowStore.activeBorrows.length > 0 ? borrowStore.activeBorrows.length : null },
  { id: 'logs', label: '操作日志', icon: '📝' }
])

const currentComponent = computed(() => {
  switch (currentView.value) {
    case 'dashboard':
      return Dashboard
    case 'categories':
      return CategoryList
    case 'specimens':
      return SpecimenList
    case 'borrow':
      return BorrowMaintenance
    case 'logs':
      return LogList
    default:
      return Dashboard
  }
})

const refreshAllData = async () => {
  await Promise.all([
    categoryStore.loadCategories(),
    specimenStore.loadSpecimens(),
    borrowStore.loadBorrowRecords(),
    maintenanceStore.loadMaintenanceRecords(),
    logStore.loadLogs()
  ])
  specimenStore.setCategoryMap(categoryStore.categoryMap)
}

const refreshForView = async (view) => {
  switch (view) {
    case 'categories':
      await categoryStore.loadCategories()
      break
    case 'specimens':
      await specimenStore.loadSpecimens()
      specimenStore.setCategoryMap(categoryStore.categoryMap)
      break
    case 'borrow':
      await Promise.all([
        specimenStore.loadSpecimens(),
        borrowStore.loadBorrowRecords(),
        maintenanceStore.loadMaintenanceRecords()
      ])
      break
    case 'logs':
      await logStore.loadLogs()
      break
    case 'dashboard':
      await Promise.all([
        specimenStore.loadSpecimens(),
        borrowStore.loadBorrowRecords(),
        maintenanceStore.loadMaintenanceRecords()
      ])
      break
  }
}

const initData = async () => {
  await categoryStore.loadCategories()
  await categoryStore.initDefaultCategories()
  specimenStore.setCategoryMap(categoryStore.categoryMap)
  await specimenStore.loadSpecimens()
  await borrowStore.loadBorrowRecords()
  await maintenanceStore.loadMaintenanceRecords()
  await logStore.loadLogs()
}

watch(currentView, (newView) => {
  refreshForView(newView)
})

onMounted(() => {
  initData()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: var(--white);
  padding: 15px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-logo {
  font-size: 36px;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.app-subtitle {
  font-size: 11px;
  opacity: 0.8;
}

.app-user {
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.app-main {
  flex: 1;
  padding: 20px 0;
}

.app-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  background: var(--white);
  padding: 10px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  color: var(--text-color);
  font-size: 14px;
  position: relative;
}

.nav-item:hover {
  background: #f0f0f0;
}

.nav-item.active {
  background: var(--primary-color);
  color: var(--white);
}

.nav-icon {
  font-size: 18px;
}

.nav-label {
  font-weight: 500;
}

.nav-badge {
  background: #dc3545;
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.app-content {
  min-height: 500px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .app-title {
    font-size: 16px;
  }

  .app-subtitle {
    display: none;
  }

  .app-nav {
    padding: 8px;
  }

  .nav-item {
    padding: 10px 12px;
    font-size: 13px;
  }

  .nav-label {
    display: none;
  }
}
</style>