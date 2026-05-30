<template>
  <div class="usage-stats-page">
    <div class="page-header">
      <h2 class="page-title">器材使用统计</h2>
      <div class="stats-summary">
        <div class="stat-card">
          <div class="stat-icon total">
            <el-icon :size="28"><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ totalHours.toFixed(1) }}</p>
            <p class="stat-label">累计使用时长(小时)</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon equipment">
            <el-icon :size="28"><Camera /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ completedOrders.length }}</p>
            <p class="stat-label">已验收器材</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon records">
            <el-icon :size="28"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ allRecords.length }}</p>
            <p class="stat-label">观测记录</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon targets">
            <el-icon :size="28"><Moon /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ uniqueTargets.length }}</p>
            <p class="stat-label">观测目标数</p>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-content">
      <div class="section">
        <h3 class="section-title">器材使用排行</h3>
        <el-table :data="equipmentRanking" border>
          <el-table-column type="index" label="排名" width="60" />
          <el-table-column prop="equipmentName" label="器材名称" min-width="200" />
          <el-table-column prop="usageHours" label="使用时长(小时)" width="140" sortable />
          <el-table-column prop="recordCount" label="观测次数" width="120" />
          <el-table-column prop="lastUsed" label="最近使用" width="120" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewRecords(row)">
                查看记录
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="section">
        <h3 class="section-title">观测目标统计</h3>
        <div class="target-stats">
          <div 
            v-for="(stat, index) in targetStats" 
            :key="stat.target"
            class="target-item"
          >
            <div class="target-rank">{{ index + 1 }}</div>
            <div class="target-info">
              <span class="target-name">{{ stat.target }}</span>
              <span class="target-count">观测 {{ stat.count }} 次</span>
            </div>
            <div class="target-bar">
              <div 
                class="target-progress" 
                :style="{ width: `${(stat.count / maxTargetCount) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">最近观测记录</h3>
        <el-table :data="recentRecords" border>
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="equipmentName" label="使用器材" min-width="200" />
          <el-table-column prop="target" label="观测目标" min-width="180" />
          <el-table-column prop="duration" label="时长(小时)" width="120" />
          <el-table-column prop="location" label="地点" width="140" />
          <el-table-column prop="weather" label="天气" width="100" />
          <el-table-column prop="notes" label="备注" min-width="200" show-overflow-tooltip />
        </el-table>
      </div>
    </div>

    <el-dialog
      v-model="recordsDialogVisible"
      title="器材使用记录"
      width="900px"
    >
      <div class="records-header">
        <h4>{{ currentEquipment?.equipmentName }}</h4>
        <el-tag type="primary" size="large">
          累计使用 {{ currentEquipment?.usageHours || 0 }} 小时
        </el-tag>
      </div>
      <el-table :data="currentRecords" border>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="target" label="观测目标" min-width="180" />
        <el-table-column prop="duration" label="时长(小时)" width="120" />
        <el-table-column prop="location" label="地点" width="140" />
        <el-table-column prop="weather" label="天气" width="100" />
        <el-table-column prop="notes" label="备注" min-width="200" show-overflow-tooltip />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOrderStore } from '@/store/order'
import { useEquipmentStore } from '@/store/equipment'

const orderStore = useOrderStore()
const equipmentStore = useEquipmentStore()

const recordsDialogVisible = ref(false)
const currentEquipment = ref(null)
const currentRecords = ref([])

const completedOrders = computed(() => {
  return orderStore.getCompletedOrders
})

const allRecords = computed(() => {
  return orderStore.usageRecords
})

const totalHours = computed(() => {
  return allRecords.value.reduce((sum, r) => sum + r.duration, 0)
})

const uniqueTargets = computed(() => {
  const targets = new Set(allRecords.value.map(r => r.target))
  return Array.from(targets)
})

const equipmentRanking = computed(() => {
  const ranking = completedOrders.value.map(order => {
    const records = orderStore.getUsageRecordsByOrder(order.id)
    return {
      orderId: order.id,
      equipmentId: order.equipmentId,
      equipmentName: order.equipmentName,
      usageHours: order.usageHours || 0,
      recordCount: records.length,
      lastUsed: records.length > 0 ? records[0].date : '-'
    }
  })
  return ranking.sort((a, b) => b.usageHours - a.usageHours)
})

const targetStats = computed(() => {
  const targetMap = {}
  allRecords.value.forEach(record => {
    if (!targetMap[record.target]) {
      targetMap[record.target] = 0
    }
    targetMap[record.target]++
  })
  const stats = Object.entries(targetMap).map(([target, count]) => ({
    target,
    count
  }))
  return stats.sort((a, b) => b.count - a.count)
})

const maxTargetCount = computed(() => {
  if (targetStats.value.length === 0) return 1
  return targetStats.value[0].count
})

const recentRecords = computed(() => {
  const records = allRecords.value.map(record => {
    const order = orderStore.getOrderById(record.orderId)
    return {
      ...record,
      equipmentName: order?.equipmentName || '未知器材'
    }
  })
  return records.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)
})

const viewRecords = (equipment) => {
  currentEquipment.value = equipment
  currentRecords.value = orderStore.getUsageRecordsByOrder(equipment.orderId)
  recordsDialogVisible.value = true
}
</script>

<style lang="scss" scoped>
.usage-stats-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 16px;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.equipment {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.records {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.targets {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2d3d;
  margin: 0;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin: 4px 0 0;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
  margin: 0 0 16px;
}

.target-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.target-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.target-rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  flex-shrink: 0;
}

.target-item:nth-child(1) .target-rank {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #8b6914;
}

.target-item:nth-child(2) .target-rank {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #606266;
}

.target-item:nth-child(3) .target-rank {
  background: linear-gradient(135deg, #cd7f32 0%, #daa06d 100%);
  color: #8b4513;
}

.target-info {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.target-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2d3d;
}

.target-count {
  font-size: 12px;
  color: #909399;
}

.target-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.target-progress {
  height: 100%;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.records-header h4 {
  margin: 0;
  font-size: 16px;
  color: #1f2d3d;
}
</style>
