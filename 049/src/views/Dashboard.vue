<template>
  <div class="dashboard">
    <el-row :gutter="16" class="mb-4">
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">教练总数</p>
              <p class="text-2xl font-bold text-primary mt-2">{{ coachCount }}</p>
            </div>
            <el-icon class="text-4xl text-primary"><User /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">课程总数</p>
              <p class="text-2xl font-bold text-success mt-2">{{ courseCount }}</p>
            </div>
            <el-icon class="text-4xl text-success"><Reading /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">会员总数</p>
              <p class="text-2xl font-bold text-warning mt-2">{{ memberCount }}</p>
            </div>
            <el-icon class="text-4xl text-warning"><Avatar /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">今日约课</p>
              <p class="text-2xl font-bold text-danger mt-2">{{ todayBookingCount }}</p>
            </div>
            <el-icon class="text-4xl text-danger"><Calendar /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <span>课程类型分布</span>
          </template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <span>近7日消课趋势</span>
          </template>
          <div ref="lineChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { useAppStore } from '@/stores'

const store = useAppStore()
const pieChartRef = ref<HTMLElement>()
const lineChartRef = ref<HTMLElement>()

const coachCount = computed(() => store.coaches.length)
const courseCount = computed(() => store.courses.length)
const memberCount = computed(() => store.members.length)
const todayBookingCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return store.bookings.filter(b => b.date === today).length
})

const initPieChart = () => {
  if (!pieChartRef.value) return
  const chart = echarts.init(pieChartRef.value)
  const categoryData = {} as Record<string, number>
  store.courses.forEach(c => {
    categoryData[c.category] = (categoryData[c.category] || 0) + 1
  })
  const data = Object.entries(categoryData).map(([name, value]) => ({ name, value }))
  
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      data
    }]
  })
}

const initLineChart = () => {
  if (!lineChartRef.value) return
  const chart = echarts.init(lineChartRef.value)
  const days = []
  const hours = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))
    hours.push(Math.floor(Math.random() * 20) + 10)
  }
  
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: days },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.3 },
      data: hours,
      itemStyle: { color: '#409eff' }
    }]
  })
}

onMounted(() => {
  initPieChart()
  initLineChart()
})
</script>

<style scoped>
.stat-card {
  margin-bottom: 16px;
}

.chart-card {
  height: 400px;
}

.chart {
  width: 100%;
  height: 320px;
}

.text-primary {
  color: #409eff;
}

.text-success {
  color: #67c23a;
}

.text-warning {
  color: #e6a23c;
}

.text-danger {
  color: #f56c6c;
}
</style>
