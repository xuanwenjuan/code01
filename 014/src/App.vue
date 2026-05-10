<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">🏛️ 文创产品库存管理系统</h1>
        <div class="header-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="nav-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="nav-icon">{{ tab.icon }}</span>
            <span class="nav-label">{{ tab.label }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="container">
        <Transition name="fade" mode="out-in">
          <CategoryManager v-if="activeTab === 'category'" key="category" />
          <ProductManager v-else-if="activeTab === 'product'" key="product" />
          <InventoryManager v-else-if="activeTab === 'inventory'" key="inventory" />
          <OperationLogManager v-else-if="activeTab === 'logs'" key="logs" />
        </Transition>
      </div>
    </main>

    <ToastContainer />
    <ModalDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/useCategoryStore'
import CategoryManager from '@/components/CategoryManager.vue'
import ProductManager from '@/components/ProductManager.vue'
import InventoryManager from '@/components/InventoryManager.vue'
import OperationLogManager from '@/components/OperationLogManager.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import ModalDialog from '@/components/ModalDialog.vue'

const { initializeCategories } = useCategoryStore()

const activeTab = ref<'category' | 'product' | 'inventory' | 'logs'>('product')

const tabs = [
  { id: 'category' as const, label: '分类管理', icon: '📁' },
  { id: 'product' as const, label: '产品管理', icon: '📦' },
  { id: 'inventory' as const, label: '出入库', icon: '🔄' },
  { id: 'logs' as const, label: '操作日志', icon: '📋' }
]

onMounted(() => {
  initializeCategories()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f3f4f6;
  color: #374151;
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

.header-nav {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.9);
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-btn.active {
  background: white;
  color: #1e3a8a;
}

.nav-icon {
  font-size: 16px;
}

.app-main {
  flex: 1;
  padding: 24px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
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
  .header-content {
    padding: 12px 16px;
  }

  .app-title {
    font-size: 18px;
  }

  .header-nav {
    gap: 2px;
  }

  .nav-btn {
    padding: 8px 12px;
    font-size: 13px;
    flex: 1;
    min-width: 80px;
    justify-content: center;
  }

  .nav-label {
    display: none;
  }

  .nav-icon {
    font-size: 20px;
  }

  .app-main {
    padding: 16px 0;
  }

  .container {
    padding: 0 12px;
  }
}
</style>