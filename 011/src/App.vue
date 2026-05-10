<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CategoryManagement from '@/components/CategoryManagement.vue'
import StationeryManagement from '@/components/StationeryManagement.vue'
import LendReturnManagement from '@/components/LendReturnManagement.vue'
import OperationLogs from '@/components/OperationLogs.vue'
import { getStats } from '@/utils/storage'
import type { StatData } from '@/types'

type TabType = 'categories' | 'stationery' | 'lendreturn' | 'logs'

const activeTab = ref<TabType>('stationery')

const tabs: readonly {
  readonly key: TabType
  readonly label: string
  readonly icon: string
}[] = [
  { key: 'categories', label: '分类管理', icon: '📁' },
  { key: 'stationery', label: '文具管理', icon: '📝' },
  { key: 'lendreturn', label: '领用与归还', icon: '🔄' },
  { key: 'logs', label: '操作记录', icon: '📋' }
] as const

const refreshTrigger = ref(0)
let refreshTimer: ReturnType<typeof setInterval> | null = null

function refreshData() {
  refreshTrigger.value++
}

const stats = computed<StatData>(() => {
  return getStats()
})

onMounted(() => {
  refreshTimer = setInterval(() => {
    refreshData()
  }, 60000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<template>
  <div>
    <div class="header">
      <h1>📚 校园文具库存管理系统</h1>
    </div>

    <div class="container">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalCategories }}</div>
          <div class="stat-label">文具分类</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalStationeries }}</div>
          <div class="stat-label">文具种类</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalStock }}</div>
          <div class="stat-label">总库存量</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.highQualityCount }}</div>
          <div class="stat-label">高品质文具</div>
        </div>
        <div class="stat-card" :class="{ 'stat-card-warning': stats.expiringSoon > 0 }">
          <div class="stat-value">{{ stats.expiringSoon }}</div>
          <div class="stat-label">临期预警</div>
        </div>
        <div class="stat-card" :class="{ 'stat-card-danger': stats.expired > 0 }">
          <div class="stat-value">{{ stats.expired }}</div>
          <div class="stat-label">已过期</div>
        </div>
      </div>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-button"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <CategoryManagement
        v-if="activeTab === 'categories'"
        :refresh-key="refreshTrigger"
        @updated="refreshData"
      />

      <StationeryManagement
        v-else-if="activeTab === 'stationery'"
        :refresh-key="refreshTrigger"
        @updated="refreshData"
      />

      <LendReturnManagement
        v-else-if="activeTab === 'lendreturn'"
        :refresh-key="refreshTrigger"
        @updated="refreshData"
      />

      <OperationLogs
        v-else-if="activeTab === 'logs'"
        :refresh-key="refreshTrigger"
      />
    </div>
  </div>
</template>
