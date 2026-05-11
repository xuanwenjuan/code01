<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCommunityStore } from '@/stores'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const store = useCommunityStore()

const orderChartRef = ref<HTMLDivElement>()
const paymentChartRef = ref<HTMLDivElement>()

const recentWorkOrders = computed(() => {
  return [...store.workOrders]
    .sort((a, b) => dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf())
    .slice(0, 5)
})

const recentLogs = computed(() => {
  return store.operationLogs.slice(0, 5)
})

onMounted(() => {
  initOrderChart()
  initPaymentChart()
})

function initOrderChart() {
  if (!orderChartRef.value) return
  
  const chart = echarts.init(orderChartRef.value)
  
  const statusData = [
    { name: '待派单', value: store.workOrders.filter(w => w.status === 'pending').length },
    { name: '维修中', value: store.workOrders.filter(w => w.status === 'processing').length },
    { name: '待验收', value: store.workOrders.filter(w => w.status === 'checking').length },
    { name: '已完成', value: store.workOrders.filter(w => w.status === 'completed').length }
  ]
  
  chart.setOption({
    title: {
      text: '工单状态分布',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'normal' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: statusData
      }
    ]
  })
}

function initPaymentChart() {
  if (!paymentChartRef.value) return
  
  const chart = echarts.init(paymentChartRef.value)
  
  const typeData = [
    { name: '物业费', value: store.payments.filter(p => p.type === 'property').length },
    { name: '水费', value: store.payments.filter(p => p.type === 'water').length },
    { name: '电费', value: store.payments.filter(p => p.type === 'electricity').length },
    { name: '燃气费', value: store.payments.filter(p => p.type === 'gas').length },
    { name: '停车费', value: store.payments.filter(p => p.type === 'parking').length }
  ]
  
  chart.setOption({
    title: {
      text: '费用类型分布',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'normal' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: typeData.map(d => d.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'bar',
        data: typeData.map(d => d.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#66B1FF' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '50%'
      }
    ]
  })
}

const statCards = [
  {
    title: '总房屋数',
    value: store.statistics.totalHouses,
    icon: 'House',
    color: '#409EFF',
    bgColor: '#ECF5FF'
  },
  {
    title: '入住率',
    value: store.statistics.occupancyRate + '%',
    icon: 'User',
    color: '#67C23A',
    bgColor: '#F0F9EB'
  },
  {
    title: '待处理工单',
    value: store.statistics.pendingOrders,
    icon: 'Document',
    color: '#E6A23C',
    bgColor: '#FDF6EC',
    badge: store.statistics.timeoutOrders > 0 ? `${store.statistics.timeoutOrders}超时` : undefined
  },
  {
    title: '未缴费记录',
    value: store.statistics.unpaidPayments,
    icon: 'Money',
    color: '#F56C6C',
    bgColor: '#FEF0F0'
  }
]

const getStatusTag = (status: string) => {
  const map: Record<string, { type: string; text: string }> = {
    pending: { type: 'warning', text: '待派单' },
    processing: { type: 'primary', text: '维修中' },
    checking: { type: 'info', text: '待验收' },
    completed: { type: 'success', text: '已完成' }
  }
  return map[status] || { type: 'info', text: status }
}

const getPriorityTag = (priority: string) => {
  const map: Record<string, { type: string; text: string }> = {
    high: { type: 'danger', text: '高' },
    medium: { type: 'warning', text: '中' },
    low: { type: 'success', text: '低' }
  }
  return map[priority] || { type: 'info', text: priority }
}
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card class="stat-card" :style="{ backgroundColor: card.bgColor }">
          <div class="stat-content">
            <div>
              <div class="stat-title">{{ card.title }}</div>
              <div class="stat-value" :style="{ color: card.color }">
                {{ card.value }}
                <el-badge 
                  v-if="card.badge" 
                  :value="card.badge" 
                  class="stat-badge"
                  :max="99"
                />
              </div>
            </div>
            <el-icon class="stat-icon" :size="48" :color="card.color">
              <component :is="card.icon" />
            </el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card class="chart-card">
          <div ref="orderChartRef" class="chart-container" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <div ref="paymentChartRef" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近工单</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentWorkOrders" stripe style="width: 100%">
            <el-table-column prop="title" label="工单标题" min-width="150">
              <template #default="{ row }">
                <div class="flex items-center">
                  <span v-if="row.isTimeout" class="timeout-badge">超时</span>
                  {{ row.title }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="buildingName" label="所属楼栋" width="100" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getStatusTag(row.status).type" size="small">
                  {{ getStatusTag(row.status).text }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="60">
              <template #default="{ row }">
                <el-tag :type="getPriorityTag(row.priority).type" size="small">
                  {{ getPriorityTag(row.priority).text }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>操作履历</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentLogs" stripe style="width: 100%">
            <el-table-column prop="action" label="操作" min-width="120" />
            <el-table-column prop="operatorName" label="操作人" width="100" />
            <el-table-column prop="targetType" label="对象" width="80" />
            <el-table-column prop="createTime" label="时间" width="150">
              <template #default="{ row }">
                {{ row.createTime }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  border-radius: 8px;
  border: none;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-badge {
  margin-left: 8px;
}

.stat-icon {
  opacity: 0.8;
}

.mt-20 {
  margin-top: 20px;
}

.chart-card {
  height: 350px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.timeout-badge {
  background-color: #f56c6c;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0.6;
  }
}
</style>
