<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHospitalStore } from '@/stores/hospital'
import * as echarts from 'echarts'

const store = useHospitalStore()

const statistics = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todaySlots = store.slots.filter(s => s.date === today)
  const totalReserved = todaySlots.reduce((sum, s) => sum + s.reserved, 0)
  const totalAvailable = todaySlots.reduce((sum, s) => sum + s.available, 0)
  
  const statusCounts = {
    available: store.slots.filter(s => s.status === 'available').length,
    limited: store.slots.filter(s => s.status === 'limited').length,
    full: store.slots.filter(s => s.status === 'full').length
  }
  
  return {
    totalDoctors: store.doctors.length,
    normalDoctors: store.doctors.filter(d => d.status === 'normal').length,
    stopDoctors: store.doctors.filter(d => d.status === 'stop').length,
    todayTotal: totalReserved + totalAvailable,
    todayReserved: totalReserved,
    todayAvailable: totalAvailable,
    statusCounts,
    expertWarnings: store.expertSlots.length,
    totalLogs: store.logs.length
  }
})

const registerChartRef = ref<HTMLDivElement>()
const statusChartRef = ref<HTMLDivElement>()
let registerChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null

const initCharts = () => {
  if (registerChartRef.value) {
    registerChart = echarts.init(registerChartRef.value)
    const dates: string[] = []
    const morningData: number[] = []
    const afternoonData: number[] = []
    const nightData: number[] = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dates.push(dateStr.slice(5))
      
      const daySlots = store.slots.filter(s => s.date === dateStr)
      morningData.push(daySlots.filter(s => s.time === 'morning').reduce((sum, s) => sum + s.reserved, 0))
      afternoonData.push(daySlots.filter(s => s.time === 'afternoon').reduce((sum, s) => sum + s.reserved, 0))
      nightData.push(daySlots.filter(s => s.time === 'night').reduce((sum, s) => sum + s.reserved, 0))
    }
    
    registerChart.setOption({
      title: { text: '近7日挂号趋势', left: 'center', textStyle: { fontSize: 16 } },
      tooltip: { trigger: 'axis' },
      legend: { data: ['上午', '下午', '夜间'], bottom: 10 },
      grid: { left: '3%', right: '4%', bottom: '50', containLabel: true },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [
        { name: '上午', type: 'line', stack: 'Total', data: morningData, smooth: true },
        { name: '下午', type: 'line', stack: 'Total', data: afternoonData, smooth: true },
        { name: '夜间', type: 'line', stack: 'Total', data: nightData, smooth: true }
      ]
    })
  }
  
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
    const { statusCounts } = statistics.value
    statusChart.setOption({
      title: { text: '号源状态分布', left: 'center', textStyle: { fontSize: 16 } },
      tooltip: { trigger: 'item' },
      legend: { bottom: 10 },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        label: { show: true, formatter: '{b}: {c} ({d}%)' },
        data: [
          { value: statusCounts.available, name: '充足', itemStyle: { color: '#67C23A' } },
          { value: statusCounts.limited, name: '紧张', itemStyle: { color: '#E6A23C' } },
          { value: statusCounts.full, name: '已满', itemStyle: { color: '#F56C6C' } }
        ]
      }]
    })
  }
}

const handleResize = () => {
  registerChart?.resize()
  statusChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  registerChart?.dispose()
  statusChart?.dispose()
})
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409EFF;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalDoctors }}</div>
              <div class="stat-label">医生总数</div>
            </div>
          </div>
          <div class="stat-footer">
            正常出诊: {{ statistics.normalDoctors }} | 停诊: {{ statistics.stopDoctors }}
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67C23A;">
              <el-icon><Tickets /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.todayTotal }}</div>
              <div class="stat-label">今日号源总量</div>
            </div>
          </div>
          <div class="stat-footer">
            已挂号: {{ statistics.todayReserved }} | 剩余: {{ statistics.todayAvailable }}
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" :class="{ 'warning-card': statistics.expertWarnings > 0 }">
          <div class="stat-content">
            <div class="stat-icon" style="background: #E6A23C;">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.expertWarnings }}</div>
              <div class="stat-label">专家号预警</div>
            </div>
          </div>
          <div class="stat-footer">
            专家号源紧张，请关注
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #909399;">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalLogs }}</div>
              <div class="stat-label">操作日志</div>
            </div>
          </div>
          <div class="stat-footer">
            近7天操作记录
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :lg="14">
        <el-card>
          <div ref="registerChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card>
          <div ref="statusChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <span style="font-weight: 600;">最近操作日志</span>
          </template>
          <el-table :data="store.logs.slice(0, 5)" size="small" stripe>
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="operationType" label="操作类型" width="120" />
            <el-table-column prop="operationDetail" label="操作详情" show-overflow-tooltip />
            <el-table-column prop="timestamp" label="时间" width="160">
              <template #default="{ row }">
                {{ new Date(row.timestamp).toLocaleString() }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <span style="font-weight: 600;">专家号超卖预警</span>
          </template>
          <el-empty v-if="store.expertSlots.length === 0" description="暂无专家号预警" :image-size="80" />
          <el-table v-else :data="store.expertSlots" size="small" stripe>
            <el-table-column prop="doctorName" label="医生" width="100" />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="time" label="时段" width="80">
              <template #default="{ row }">
                {{ { morning: '上午', afternoon: '下午', night: '夜间' }[row.time] }}
              </template>
            </el-table-column>
            <el-table-column prop="available" label="剩余号源">
              <template #default="{ row }">
                <el-tag type="warning" effect="dark">{{ row.available }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.stat-card {
  border-radius: 8px;
}

.stat-card.warning-card {
  border: 1px solid #E6A23C;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.stat-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #EBEEF5;
  font-size: 12px;
  color: #909399;
}
</style>
