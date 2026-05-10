<template>
  <div class="app-container">
    <header class="header">
      <div class="header-content">
        <div class="header-logo">
          🐾 宠物用品库存管理系统
        </div>
        <div class="header-operator">
          <span class="text-secondary">经办人：</span>
          <input 
            v-model="operatorName"
            type="text"
            class="form-input"
            style="width: 120px; padding: 6px 10px;"
            placeholder="请输入经办人"
            @blur="saveOperator"
          />
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'inventory' }"
          @click="switchTab('inventory')"
        >
          出入库管理
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'products' }"
          @click="switchTab('products')"
        >
          用品信息管理
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'categories' }"
          @click="switchTab('categories')"
        >
          分类管理
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'logs' }"
          @click="switchTab('logs')"
        >
          操作履历
        </div>
      </div>

      <InventoryManagement 
        v-if="activeTab === 'inventory'" 
        ref="inventoryRef"
      />

      <ProductManagement 
        v-if="activeTab === 'products'" 
        ref="productRef"
      />

      <CategoryManagement 
        v-if="activeTab === 'categories'" 
        ref="categoryRef"
      />

      <OperationLog 
        v-if="activeTab === 'logs'" 
        ref="logRef"
      />
    </main>

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ToastContainer from '@/components/ToastContainer.vue'
import InventoryManagement from '@/components/InventoryManagement.vue'
import ProductManagement from '@/components/ProductManagement.vue'
import CategoryManagement from '@/components/CategoryManagement.vue'
import OperationLog from '@/components/OperationLog.vue'
import { storageService } from '@/services/storage'
import { useToast } from '@/composables/useToast'

const { info } = useToast()

type TabType = 'inventory' | 'products' | 'categories' | 'logs'

const activeTab = ref<TabType>('inventory')
const operatorName = ref('')

const inventoryRef = ref<InstanceType<typeof InventoryManagement> | null>(null)
const productRef = ref<InstanceType<typeof ProductManagement> | null>(null)
const categoryRef = ref<InstanceType<typeof CategoryManagement> | null>(null)
const logRef = ref<InstanceType<typeof OperationLog> | null>(null)

const saveOperator = () => {
  if (operatorName.value.trim()) {
    storageService.setOperator(operatorName.value.trim())
    info(`经办人已更新为：${operatorName.value.trim()}`)
  }
}

const switchTab = (tab: TabType) => {
  activeTab.value = tab
}

watch(activeTab, (newTab) => {
  setTimeout(() => {
    switch (newTab) {
      case 'inventory':
        inventoryRef.value?.loadProducts()
        break
      case 'products':
        productRef.value?.loadProducts()
        break
      case 'categories':
        categoryRef.value?.loadCategories()
        break
      case 'logs':
        logRef.value?.loadLogs()
        break
    }
  }, 0)
})

onMounted(() => {
  operatorName.value = storageService.getOperator()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.text-secondary {
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .header-operator {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .header-operator .form-input {
    width: 100% !important;
  }
}
</style>