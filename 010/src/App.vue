<script setup lang="ts">
import { ref } from 'vue'
import Modal from './components/Modal.vue'
import CategoryManagement from './components/CategoryManagement.vue'
import EquipmentManagement from './components/EquipmentManagement.vue'
import EquipmentOperation from './components/EquipmentOperation.vue'
import OperationLogs from './components/OperationLogs.vue'
import { store } from './store'

type TabType = 'categories' | 'equipments' | 'operations' | 'logs'

const activeTab = ref<TabType>('equipments')
const fileInputRef = ref<HTMLInputElement | null>(null)

const tabs = [
  { id: 'categories' as TabType, label: '设备分类' },
  { id: 'equipments' as TabType, label: '设备信息' },
  { id: 'operations' as TabType, label: '领用归还' },
  { id: 'logs' as TabType, label: '操作日志' },
]

function switchTab(tab: TabType) {
  activeTab.value = tab
}

function exportData() {
  const jsonData = store.exportData()
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `equipment_backup_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    store.importData(content)
  }
  reader.readAsText(file)
  target.value = ''
}

function triggerImport() {
  fileInputRef.value?.click()
}
</script>

<template>
  <div class="container">
    <div class="card" style="margin-top: 20px">
      <div class="header" style="margin-bottom: 0; flex-wrap: wrap">
        <div>
          <h1 class="header-title">办公设备资产管理系统</h1>
          <p style="color: var(--text-secondary); margin-top: 4px; font-size: 14px">
            设备总数: {{ store.stats.totalEquipments }} |
            分类数量: {{ store.stats.totalCategories }} |
            总库存: {{ store.stats.totalStock }} (可用: {{ store.stats.availableStock }}) |
            操作记录: {{ store.stats.totalLogs }}
            <span v-if="store.stats.highWarnings > 0" style="color: var(--danger-color); font-weight: bold; margin-left: 8px">
              ⚠ 高优先级预警: {{ store.stats.highWarnings }}
            </span>
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap">
          <button
            v-if="store.warningEquipments.length > 0"
            class="btn btn-sm btn-warning"
            @click="store.showDetailedWarnings"
          >
            ⚠ 查看预警 ({{ store.warningEquipments.length }})
          </button>
          <button class="btn btn-sm btn-primary" @click="exportData">导出数据</button>
          <button class="btn btn-sm btn-success" @click="triggerImport">导入数据</button>
          <button class="btn btn-sm btn-danger" @click="store.clearAllData">清空数据</button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleFileImport"
          />
        </div>
      </div>
    </div>

    <div class="card">
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab"
          :class="{ active: activeTab === tab.id }"
          @click="switchTab(tab.id)"
        >
          {{ tab.label }}
          <span
            v-if="tab.id === 'operations' && store.warningEquipments.length > 0"
            style="
              background: var(--danger-color);
              color: white;
              font-size: 11px;
              padding: 1px 6px;
              border-radius: 10px;
              margin-left: 4px;
            "
          >
            {{ store.warningEquipments.length }}
          </span>
        </div>
      </div>

      <CategoryManagement v-if="activeTab === 'categories'" />
      <EquipmentManagement v-if="activeTab === 'equipments'" />
      <EquipmentOperation v-if="activeTab === 'operations'" />
      <OperationLogs v-if="activeTab === 'logs'" />
    </div>

    <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 12px">
      办公设备资产管理系统 v1.0.0 - 数据持久化到本地存储 | 支持导入导出备份
    </div>

    <Modal />
  </div>
</template>
