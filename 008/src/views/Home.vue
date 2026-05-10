<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFoodItemStore } from '@/stores/foodItem'
import { useCategoryStore } from '@/stores/category'
import { useOperationLogStore } from '@/stores/operationLog'
import { getFreshnessLabel, getExpiryStatus } from '@/utils/storage'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const foodItemStore = useFoodItemStore()
const categoryStore = useCategoryStore()
const logStore = useOperationLogStore()

const showBatchProcessConfirm = ref(false)

const expiryStats = computed(() => foodItemStore.getExpiryCount())

const statCards = computed(() => [
  { label: '食材种类', value: foodItemStore.totalItems, icon: '🥬', class: '' },
  { label: '库存总量', value: foodItemStore.totalStock, icon: '📦', class: 'success' },
  { label: '分类数量', value: categoryStore.totalCategories, icon: '📁', class: '' },
  { label: '紧急临期', value: expiryStats.value.urgent, icon: '🔥', class: 'danger' },
  { label: '临期食材', value: expiryStats.value.nearly, icon: '⚠️', class: 'warning' },
  { label: '过期食材', value: expiryStats.value.expired, icon: '❌', class: 'danger' },
  { label: '正常食材', value: expiryStats.value.normal, icon: '✅', class: 'success' },
  { label: '操作记录', value: logStore.totalLogs, icon: '📝', class: '' }
])

const hasExpiredItems = computed(() => foodItemStore.expiredItems.length > 0)
const hasNearlyExpiredItems = computed(() => foodItemStore.nearlyExpiredItems.length > 0)
const hasUrgentItems = computed(() => foodItemStore.urgentExpiredItems.length > 0)

function handleBatchProcess() {
  foodItemStore.processAllExpired('管理员')
  showBatchProcessConfirm.value = false
}

function goToOperations() {
  router.push('/operations')
}

const getRemainingDaysBadge = (days: number) => {
  return getExpiryStatus(days).badgeClass
}

const getFreshnessBadge = (level: string) => {
  const badges: Record<string, string> = {
    excellent: 'badge-success',
    good: 'badge-primary',
    normal: 'badge-info',
    low: 'badge-warning'
  }
  return badges[level] || 'badge-info'
}

const getStockChangeBadge = (change: number) => {
  return change > 0 ? 'badge-success' : 'badge-danger'
}
</script>

<template>
  <div>
    <header class="page-header">
      <h1 class="page-title">📊 库存概览</h1>
      <div style="display: flex; gap: 8px;">
        <button
          v-if="hasNearlyExpiredItems"
          class="btn btn-warning btn-sm"
          @click="goToOperations"
        >
          去处理临期食材
        </button>
        <button
          v-if="hasExpiredItems"
          class="btn btn-danger btn-sm"
          @click="showBatchProcessConfirm = true"
        >
          批量处理过期食材
        </button>
      </div>
    </header>
    <div class="page-body">
      <div v-if="hasUrgentItems" class="filter-section" style="background-color: #fef2f2; border-color: #fecaca; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="color: #991b1b; font-weight: 600; font-size: 16px;">
              🔥 紧急提醒：有 {{ expiryStats.urgent }} 个食材将在3天内过期！
            </div>
            <div style="color: #7f1d1d; font-size: 14px; margin-top: 4px;">
              请立即处理：{{ foodItemStore.urgentExpiredItems.map(i => i.name).join('、') }}
            </div>
          </div>
          <button class="btn btn-danger btn-sm" @click="goToOperations">
            立即处理
          </button>
        </div>
      </div>

      <div v-if="hasNearlyExpiredItems && !hasUrgentItems" class="filter-section" style="background-color: #fffbeb; border-color: #fcd34d; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="color: #92400e; font-weight: 600; font-size: 16px;">
              ⚠️ 温馨提醒：有 {{ expiryStats.nearly }} 个食材将在7天内过期
            </div>
            <div style="color: #78350f; font-size: 14px; margin-top: 4px;">
              建议尽快安排出库使用
            </div>
          </div>
          <button class="btn btn-warning btn-sm" @click="goToOperations">
            查看详情
          </button>
        </div>
      </div>

      <div class="stat-grid">
        <div
          v-for="stat in statCards"
          :key="stat.label"
          class="stat-card"
          :class="stat.class"
        >
          <div style="font-size: 24px; margin-bottom: 4px;">{{ stat.icon }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
        </div>
      </div>

      <div class="card" v-if="hasNearlyExpiredItems || hasExpiredItems">
        <div class="card-header">
          <span class="card-title">⚠️ 临期/过期预警</span>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>紧急程度</th>
                <th>食材名称</th>
                <th>分类</th>
                <th>库存数量</th>
                <th>新鲜等级</th>
                <th>剩余保质期</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in [...foodItemStore.urgentExpiredItems, ...foodItemStore.nearlyExpiredItems, ...foodItemStore.expiredItems]"
                :key="item.id"
                :style="{ backgroundColor: item.remainingDays <= 0 ? '#fef2f2' : (item.remainingDays <= 3 ? '#fffbeb' : 'inherit') }"
              >
                <td>
                  <span v-if="item.remainingDays <= 0" class="badge badge-danger">
                    ❌ 已过期
                  </span>
                  <span v-else-if="item.remainingDays <= 3" class="badge badge-danger">
                    🔥 紧急
                  </span>
                  <span v-else class="badge badge-warning">
                    ⚠️ 临期
                  </span>
                </td>
                <td :style="{ fontWeight: 600 }">{{ item.name }}</td>
                <td>{{ item.categoryName }}</td>
                <td>{{ item.stockQuantity }}</td>
                <td>
                  <span class="badge" :class="getFreshnessBadge(item.freshnessLevel)">
                    {{ getFreshnessLabel(item.freshnessLevel) }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="getRemainingDaysBadge(item.remainingDays)">
                    {{ item.remainingDays }} 天
                  </span>
                </td>
                <td>
                  <span class="badge" :class="getExpiryStatus(item.remainingDays).badgeClass">
                    {{ getExpiryStatus(item.remainingDays).status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-primary" @click="goToOperations">
                    处理
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" v-if="logStore.recentLogs.length > 0">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <span class="card-title">📝 最近操作</span>
          <button class="btn btn-link btn-sm" @click="router.push('/logs')">
            查看全部
          </button>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>操作时间</th>
                <th>经办人</th>
                <th>操作类型</th>
                <th>食材名称</th>
                <th>操作内容</th>
                <th>库存变更</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logStore.recentLogs.slice(0, 10)" :key="log.id">
                <td style="white-space: nowrap;">{{ log.operationTime }}</td>
                <td>{{ log.operator }}</td>
                <td>
                  <span
                    :class="getStockChangeBadge(log.stockChange)"
                    class="badge"
                  >
                    {{ log.stockChange > 0 ? '入库' : (log.operationType === 'expired-process' ? '临期处理' : '出库') }}
                  </span>
                </td>
                <td>{{ log.foodItemName }}</td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis;">
                  {{ log.operationContent }}
                </td>
                <td>
                  <span
                    :class="getStockChangeBadge(log.stockChange)"
                    class="badge"
                  >
                    {{ log.stockChange > 0 ? '+' : '' }}{{ log.stockChange }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="foodItemStore.foodItems.length === 0" class="card">
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-text">暂无食材数据，请先添加食材</div>
          <div style="margin-top: 16px;">
            <button class="btn btn-primary" @click="router.push('/food-items')">
              去添加食材
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model:visible="showBatchProcessConfirm"
      title="批量处理确认"
      :message="`确定要批量处理所有 ${foodItemStore.expiredItems.length} 个过期食材吗？`"
      type="danger"
      confirmText="确认处理"
      @confirm="handleBatchProcess"
    />
  </div>
</template>
