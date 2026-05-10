<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">🏋️ 健身房器材管理系统</h1>
        <div class="header-stats">
          <span class="stat-item">
            <span class="stat-value">{{ equipments.length }}</span>
            <span class="stat-label">器材总数</span>
          </span>
          <span class="stat-item">
            <span class="stat-value">{{ categories.length }}</span>
            <span class="stat-label">分类数量</span>
          </span>
          <span v-if="warningEquipments.length > 0" class="stat-item warning">
            <span class="stat-value">{{ warningEquipments.length }}</span>
            <span class="stat-label">需维护</span>
          </span>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <FilterPanel 
          v-if="activeTab === 'equipments'"
          :result-count="filteredEquipments.length" 
        />

        <EquipmentTable 
          v-if="activeTab === 'equipments'"
          :equipments="filteredEquipments" 
        />

        <CategoryManager v-if="activeTab === 'categories'" />
        
        <EquipmentOperation v-if="activeTab === 'operation'" />
        
        <OperationLogList v-if="activeTab === 'logs'" />
      </div>
    </main>

    <footer class="app-footer">
      <p>© 2026 健身房器材管理系统 - 本地存储版本</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEquipmentStore } from '@/composables/useEquipmentStore'
import CategoryManager from '@/components/CategoryManager.vue'
import EquipmentTable from '@/components/EquipmentTable.vue'
import EquipmentOperation from '@/components/EquipmentOperation.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import OperationLogList from '@/components/OperationLogList.vue'

const { categories, equipments, filteredEquipments, warningEquipments } = useEquipmentStore()

const activeTab = ref('equipments')

const tabs = [
  { key: 'equipments', label: '器材信息' },
  { key: 'categories', label: '分类管理' },
  { key: 'operation', label: '领用归还' },
  { key: 'logs', label: '操作日志' }
]
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.stat-item.warning .stat-value {
  color: #ffd700;
}

.app-main {
  flex: 1;
  padding: 24px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e4e7ed;
  padding-bottom: 0;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  font-size: 15px;
  cursor: pointer;
  color: #666;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #409eff;
}

.tab-btn.active {
  color: #409eff;
  border-bottom-color: #409eff;
  font-weight: 500;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.app-footer {
  background: white;
  padding: 16px;
  text-align: center;
  border-top: 1px solid #eee;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .app-header {
    padding: 16px 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .app-title {
    font-size: 20px;
  }

  .header-stats {
    gap: 16px;
  }

  .stat-value {
    font-size: 20px;
  }

  .app-main {
    padding: 16px;
  }

  .tab-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
}
</style>
