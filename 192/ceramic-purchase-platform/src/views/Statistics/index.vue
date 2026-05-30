<template>
  <div class="statistics-page">
    <div class="container">
      <el-page-header @back="goBack" class="mb-20">
        <template #content>
          <span>原料用量统计</span>
        </template>
      </el-page-header>

      <div class="card">
        <div class="filter-area">
          <el-date-picker
            v-model="dateRange"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            style="width: 300px"
            @change="handleDateChange"
          />
          <el-button type="primary" @click="handleExportStats">
            <el-icon><Download /></el-icon> 导出统计报告
          </el-button>
        </div>

        <el-row :gutter="24" class="stats-overview">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon blue">
                <el-icon><ShoppingBag /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalOrders }}</div>
                <div class="stat-label">采购订单数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon green">
                <el-icon><Wallet /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">¥{{ stats.totalSpent.toFixed(2) }}</div>
                <div class="stat-label">采购总金额</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon orange">
                <el-icon><Box /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalItems }}</div>
                <div class="stat-label">采购原料总数量</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon purple">
                <el-icon><Goods /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.uniqueMaterials }}</div>
                <div class="stat-label">原料种类数</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <h3 class="section-title">采购原料用量排行</h3>
        <el-table :data="materialRanking" border style="width: 100%">
          <el-table-column label="排名" width="80" align="center">
            <template #default="{ $index }">
              <el-tag
                :type="$index < 3 ? (['danger', 'warning', 'success'][$index]) : 'info'"
                effect="dark"
              >
                {{ $index + 1 }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="原料名称" min-width="200" />
          <el-table-column prop="category" label="类别" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ getCategoryName(row.categoryId) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalQuantity" label="累计采购量" width="150" align="right">
            <template #default="{ row }">
              {{ row.totalQuantity }} {{ row.unit }}
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="累计采购金额" width="150" align="right">
            <template #default="{ row }">
              ¥{{ row.totalAmount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="占比" width="200">
            <template #default="{ row }">
              <div class="progress-wrapper">
                <el-progress
                  :percentage="((row.totalAmount / stats.totalSpent) * 100).toFixed(1)"
                  :stroke-width="12"
                  :color="getProgressColor($index)"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>

        <h3 class="section-title">分类采购统计</h3>
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="category-chart">
              <svg viewBox="0 0 400 400" class="pie-chart">
                <circle
                  v-for="(item, index) in categoryStats"
                  :key="item.name"
                  cx="200"
                  cy="200"
                  r="150"
                  fill="transparent"
                  :stroke="item.color"
                  stroke-width="60"
                  :stroke-dasharray="`${item.percentage * 9.42} 942`"
                  :stroke-dashoffset="-getCategoryStrokeOffset(index)"
                  class="pie-segment"
                />
              </svg>
              <div class="chart-center">
                <div class="chart-total">¥{{ stats.totalSpent.toFixed(0) }}</div>
                <div class="chart-label">总采购额</div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="category-legend">
              <div
                v-for="item in categoryStats"
                :key="item.name"
                class="legend-item"
              >
                <span class="legend-color" :style="{ background: item.color }"></span>
                <span class="legend-name">{{ item.name }}</span>
                <span class="legend-amount">¥{{ item.amount.toFixed(2) }}</span>
                <span class="legend-percent">{{ item.percentage.toFixed(1) }}%</span>
              </div>
            </div>
          </el-col>
        </el-row>

        <h3 class="section-title">月度采购趋势</h3>
        <div class="monthly-chart">
          <div class="chart-bars">
            <div
              v-for="(item, index) in monthlyStats"
              :key="item.month"
              class="bar-item"
            >
              <div class="bar-wrapper">
                <div
                  class="bar"
                  :style="{ height: `${(item.amount / maxMonthlyAmount) * 100}%` }"
                >
                  <span class="bar-value">¥{{ item.amount.toFixed(0) }}</span>
                </div>
              </div>
              <div class="bar-label">{{ item.month }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useOrdersStore } from '@/store/orders'
import { mockCategories } from '@/mock/materials'

const router = useRouter()
const ordersStore = useOrdersStore()

const dateRange = ref([])

const categoryColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#8e44ad']

const filteredOrders = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return ordersStore.userOrders.filter(o => o.status !== 'cancelled')
  }
  const [start, end] = dateRange.value
  return ordersStore.userOrders.filter(o => {
    if (o.status === 'cancelled') return false
    const orderDate = new Date(o.createdAt)
    return orderDate >= new Date(start) && orderDate <= new Date(end)
  })
})

const stats = computed(() => {
  const orders = filteredOrders.value
  const materialSet = new Set()
  let totalItems = 0
  
  orders.forEach(order => {
    order.items.forEach(item => {
      materialSet.add(item.materialId)
      totalItems += item.quantity
    })
  })
  
  return {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    totalItems,
    uniqueMaterials: materialSet.size
  }
})

const materialRanking = computed(() => {
  const orders = filteredOrders.value
  const materialMap = new Map()
  
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!materialMap.has(item.materialId)) {
        materialMap.set(item.materialId, {
          id: item.materialId,
          name: item.name,
          image: item.image,
          totalQuantity: 0,
          totalAmount: 0,
          categoryId: 1,
          unit: '件'
        })
      }
      const data = materialMap.get(item.materialId)
      data.totalQuantity += item.quantity
      data.totalAmount += item.price * item.quantity
    })
  })
  
  return Array.from(materialMap.values()).sort((a, b) => b.totalAmount - a.totalAmount)
})

const categoryStats = computed(() => {
  const orders = filteredOrders.value
  const categoryMap = new Map()
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const categoryId = item.categoryId || 1
      const category = mockCategories.find(c => c.id === categoryId) || mockCategories[0]
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          name: category.name,
          amount: 0,
          color: categoryColors[categoryId - 1] || '#409eff'
        })
      }
      categoryMap.get(categoryId).amount += item.price * item.quantity
    })
  })
  
  const total = stats.value.totalSpent
  return Array.from(categoryMap.values()).map(item => ({
    ...item,
    percentage: total > 0 ? (item.amount / total) * 100 : 0
  })).sort((a, b) => b.amount - a.amount)
})

const monthlyStats = computed(() => {
  const orders = filteredOrders.value
  const monthMap = new Map()
  
  orders.forEach(order => {
    const date = new Date(order.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, 0)
    }
    monthMap.set(monthKey, monthMap.get(monthKey) + order.totalAmount)
  })
  
  return Array.from(monthMap.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
})

const maxMonthlyAmount = computed(() => {
  if (monthlyStats.value.length === 0) return 1
  return Math.max(...monthlyStats.value.map(m => m.amount))
})

const getCategoryStrokeOffset = (index) => {
  if (index === 0) return 0
  let offset = 0
  for (let i = 0; i < index; i++) {
    offset += categoryStats.value[i].percentage * 9.42
  }
  return offset
}

const getCategoryName = (categoryId) => {
  const category = mockCategories.find(c => c.id === categoryId)
  return category?.name || '其他'
}

const getProgressColor = (index) => {
  return ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399'][index] || '#409eff'
}

const handleDateChange = () => {
  ElMessage.success('统计数据已更新')
}

const handleExportStats = () => {
  const orders = filteredOrders.value
  if (orders.length === 0) {
    ElMessage.warning('暂无统计数据可导出')
    return
  }
  
  let csvContent = '原料名称,累计采购量,累计采购金额,占比\n'
  
  materialRanking.value.forEach((item, index) => {
    const percentage = ((item.totalAmount / stats.value.totalSpent) * 100).toFixed(2)
    csvContent += `${item.name},${item.totalQuantity} ${item.unit},¥${item.totalAmount.toFixed(2)},${percentage}%\n`
  })
  
  csvContent += '\n分类统计\n'
  csvContent += '分类,金额,占比\n'
  categoryStats.value.forEach(item => {
    csvContent += `${item.name},¥${item.amount.toFixed(2)},${item.percentage.toFixed(2)}%\n`
  })
  
  csvContent += '\n月度趋势\n'
  csvContent += '月份,采购金额\n'
  monthlyStats.value.forEach(item => {
    csvContent += `${item.month},¥${item.amount.toFixed(2)}\n`
  })
  
  csvContent += `\n总采购额,¥${stats.value.totalSpent.toFixed(2)}\n`
  csvContent += `总订单数,${stats.value.totalOrders}\n`
  csvContent += `总采购量,${stats.value.totalItems}\n`
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `原料采购统计_${new Date().toLocaleDateString()}.csv`
  link.click()
  
  ElMessage.success('统计报告导出成功')
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  dateRange.value = [sixMonthsAgo, now]
})
</script>

<style scoped>
.statistics-page {
  padding-bottom: 40px;
}

.filter-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.stats-overview {
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.stat-icon.green {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #8e44ad, #a569bd);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 32px 0 16px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
  color: #303133;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.category-chart {
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-chart {
  width: 400px;
  height: 400px;
  transform: rotate(-90deg);
}

.pie-segment {
  transition: stroke-dasharray 0.5s ease;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.chart-total {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.chart-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.category-legend {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.legend-amount {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 100px;
  text-align: right;
}

.legend-percent {
  font-size: 14px;
  color: #909399;
  min-width: 60px;
  text-align: right;
}

.monthly-chart {
  padding: 24px 0;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  height: 300px;
  padding: 0 20px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar-wrapper {
  width: 100%;
  height: 240px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 60%;
  background: linear-gradient(180deg, #409eff, #66b1ff);
  border-radius: 8px 8px 0 0;
  position: relative;
  transition: height 0.5s ease;
  min-height: 20px;
}

.bar-value {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

.bar-label {
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
}
</style>
