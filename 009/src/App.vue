<template>
  <div class="app-container">
    <Toast />
    
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">母婴用品库存登记管理系统</h1>
        <div class="header-info">
          <span class="operator-info">当前经办人：{{ operator }}</span>
        </div>
      </div>
    </header>
    
    <nav class="app-nav">
      <div class="nav-container">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['nav-btn', { active: activeTab === tab.id }]"
          @click="switchTab(tab.id)"
        >
          {{ tab.name }}
          <span 
            v-if="tab.id === 'stock' && nearExpiryCount > 0" 
            class="nav-badge"
          >
            {{ nearExpiryCount }}
          </span>
        </button>
      </div>
    </nav>
    
    <main class="app-main">
      <div class="main-container">
        <CategoryManagement
          v-if="activeTab === 'category'"
          ref="categoryRef"
          @update="handleDataUpdate"
        />
        
        <ProductManagement
          v-else-if="activeTab === 'product'"
          ref="productRef"
          @update="handleDataUpdate"
        />
        
        <StockOperation
          v-else-if="activeTab === 'stock'"
          ref="stockRef"
          @update="handleDataUpdate"
        />
        
        <OperationLogs
          v-else-if="activeTab === 'logs'"
          ref="logsRef"
        />
      </div>
    </main>
    
    <footer class="app-footer">
      <div class="footer-content">
        <p>母婴用品库存登记管理系统 &copy; {{ currentYear }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Toast from './components/common/Toast.vue'
import CategoryManagement from './components/CategoryManagement.vue'
import ProductManagement from './components/ProductManagement.vue'
import StockOperation from './components/StockOperation.vue'
import OperationLogs from './components/OperationLogs.vue'
import { state, loadAllData, updateProductShelfLife } from './store'

interface Tab {
  id: string
  name: string
}

const tabs: Tab[] = [
  { id: 'category', name: '分类管理' },
  { id: 'product', name: '用品信息' },
  { id: 'stock', name: '出入库管理' },
  { id: 'logs', name: '操作日志' }
]

const activeTab = ref<string>('category')
const operator = computed(() => state.operator)
const currentYear = ref<number>(new Date().getFullYear())
const nearExpiryCount = computed(() => state.nearExpiryProducts.length)

const categoryRef = ref<InstanceType<typeof CategoryManagement> | null>(null)
const productRef = ref<InstanceType<typeof ProductManagement> | null>(null)
const stockRef = ref<InstanceType<typeof StockOperation> | null>(null)
const logsRef = ref<InstanceType<typeof OperationLogs> | null>(null)

let shelfLifeTimer: number | null = null

function switchTab(tabId: string): void {
  activeTab.value = tabId
  
  if (tabId === 'logs' && logsRef.value) {
    logsRef.value.loadData()
  }
}

function handleDataUpdate(): void {
  loadAllData()
  
  if (stockRef.value) {
    stockRef.value.loadData()
  }
  if (productRef.value) {
    productRef.value.loadData()
  }
  if (categoryRef.value) {
    categoryRef.value.loadData()
  }
  if (logsRef.value) {
    logsRef.value.loadData()
  }
}

onMounted(() => {
  loadAllData()
  
  shelfLifeTimer = window.setInterval(() => {
    updateProductShelfLife()
    loadAllData()
  }, 60000)
})

onUnmounted(() => {
  if (shelfLifeTimer) {
    window.clearInterval(shelfLifeTimer)
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: var(--white);
  padding: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.operator-info {
  font-size: 14px;
  opacity: 0.9;
}

.app-nav {
  background-color: var(--white);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  gap: 4px;
}

.nav-btn {
  position: relative;
  padding: 14px 28px;
  border: none;
  background: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color-secondary);
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.nav-btn:hover {
  color: var(--primary-color);
  background-color: #f5f7fa;
}

.nav-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  background-color: #f5f7fa;
}

.nav-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: var(--danger-color);
  color: var(--white);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.app-main {
  flex: 1;
  padding: 24px 0;
}

.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.app-footer {
  background-color: var(--white);
  border-top: 1px solid var(--border-color);
  padding: 16px 0;
  color: var(--text-color-secondary);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  font-size: 13px;
}

.footer-content p {
  margin: 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .app-title {
    font-size: 20px;
  }
  
  .nav-container {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-btn {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .main-container {
    padding: 0 12px;
  }
}
</style>
