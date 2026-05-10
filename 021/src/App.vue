<template>
  <div style="min-height: 100vh; padding: 20px;">
    <div class="card">
      <h1 style="text-align: center; color: #409eff; margin-bottom: 10px;">
        小型美妆店产品管理系统
      </h1>
      <div style="text-align: center; color: #909399; margin-bottom: 20px;">
        Vue3 + TypeScript + Vite + SessionStorage
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="['btn', activeTab === tab.key ? 'btn-primary' : 'btn-secondary']"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <CategoryManagement v-if="activeTab === 'categories'" />
    <ProductManagement v-if="activeTab === 'products'" />
    <StockManagement v-if="activeTab === 'stock'" />
    <OperationLogs v-if="activeTab === 'logs'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CategoryManagement from './components/CategoryManagement.vue'
import ProductManagement from './components/ProductManagement.vue'
import StockManagement from './components/StockManagement.vue'
import OperationLogs from './components/OperationLogs.vue'

const tabs = [
  { key: 'categories', label: '产品分类管理' },
  { key: 'products', label: '产品信息管理' },
  { key: 'stock', label: '产品出入库管理' },
  { key: 'logs', label: '操作履历管理' }
]

const activeTab = ref('products')
</script>
