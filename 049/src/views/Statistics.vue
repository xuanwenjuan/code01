<template>
  <div class="statistics">
    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="card-header">
          <span class="title">筛选条件</span>
          <el-button type="primary" @click="handleQuery" :loading="queryLoading">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="教练">
            <el-select
              v-model="filters.coachId"
              placeholder="请选择教练"
              clearable
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="c in store.coaches"
                :key="c.id"
                :label="c.name"
                :value="c.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="课程类型">
            <el-select
              v-model="filters.category"
              placeholder="请选择课程类型"
              clearable
              style="width: 100%"
            >
              <el-option label="私教一对一" value="私教一对一" />
              <el-option label="小班团课" value="小班团课" />
              <el-option label="瑜伽普拉提" value="瑜伽普拉提" />
              <el-option label="有氧燃脂" value="有氧燃脂" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="24" :md="8" :lg="12">
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="16" class="mb-4">
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="text-center">
            <p class="label">消课总课时</p>
            <p class="value text-primary">{{ totalHours }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="text-center">
            <p class="label">消课总次数</p>
            <p class="value text-success">{{ totalCount }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="text-center">
            <p class="label">涉及教练数</p>
            <p class="value text-warning">{{ coachCount }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="text-center">
            <p class="label">平均课时/次</p>
            <p class="value text-danger">{{ avgHours }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mb-4">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span>按教练消课统计</span>
          </template>
          <div ref="barChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span>按课程类型消课统计</span>
          </template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <span class="title">消课明细</span>
      </template>
      <el-table
        :data="paginatedStats"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="coachName" label="教练" width="120" />
        <el-table-column prop="courseCategory" label="课程类型" min-width="150" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="hours" label="课时" width="100" align="center" />
        <el-table-column prop="count" label="次数" width="100" align="center" />
        <template #empty>
          <EmptyState description="暂无消课数据" />
        </template>
      </el-table>

      <Pagination
        v-model="currentPage"
        :total="filteredData.length"
        :page-size="pageSize"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores'
import Pagination from '@/components/Pagination.vue'
import EmptyState from '@/components/EmptyState.vue'
import type { ConsumptionStats, CourseCategory, StatsSearchParams } from '@/types'

const store = useAppStore()
const barChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
const loading = ref(false)
const queryLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const filters = reactive<StatsSearchParams>({
  coachId: '',
  category: '',
  dateRange: []
})

const statsData = ref<ConsumptionStats[]>([])

const filteredData = computed<ConsumptionStats[]>(() => {
  return statsData.value.filter(item => {
    const matchCoach = !filters.coachId || item.coachId === filters.coachId
    const matchCategory = !filters.category || item.courseCategory === filters.category
    let matchDate = true
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange
      matchDate = item.date >= start && item.date <= end
    }
    return matchCoach && matchCategory && matchDate
  })
})

const paginatedStats = computed<ConsumptionStats[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const totalHours = computed<number>(() => filteredData.value.reduce((sum, item) => sum + item.hours, 0))
const totalCount = computed<number>(() => filteredData.value.reduce((sum, item) => sum + item.count, 0))
const coachCount = computed<number>(() => new Set(filteredData.value.map(item => item.coachId)).size)
const avgHours = computed<string>(() => totalCount.value > 0 ? (totalHours.value / totalCount.value).toFixed(1) : '0')

const handleQuery = async (): Promise<void> => {
  queryLoading.value = true
  loading.value = true

  try {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 600))

    currentPage.value = 1
    updateCharts()
    ElMessage.success('查询完成')
  } finally {
    queryLoading.value = false
    loading.value = false
  }
}

const handleReset = (): void => {
  Object.assign(filters, {
    coachId: '',
    category: '',
    dateRange: []
  })
  currentPage.value = 1
  updateCharts()
  ElMessage.info('已重置筛选条件')
}

const handleSizeChange = (size: number): void => {
  pageSize.value = size
  currentPage.value = 1
}

const initBarChart = (data: ConsumptionStats[]): void => {
  nextTick(() => {
    if (!barChartRef.value) return

    const barChart = echarts.getInstanceByDom(barChartRef.value)
    if (barChart) {
      barChart.dispose()
    }

    const chart = echarts.init(barChartRef.value)
    const coachStats: Record<string, number> = {}
    data.forEach(item => {
      coachStats[item.coachName] = (coachStats[item.coachName] || 0) + item.hours
    })
    const sortedData = Object.entries(coachStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}: {c} 课时'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: sortedData.map(d => d[0]),
        axisLabel: {
          rotate: 30,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        name: '课时'
      },
      series: [{
        type: 'bar',
        data: sortedData.map(d => d[1]),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#67c23a' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '50%'
      }]
    })

    window.addEventListener('resize', () => chart.resize())
  })
}

const initPieChart = (data: ConsumptionStats[]): void => {
  nextTick(() => {
    if (!pieChartRef.value) return

    const pieChart = echarts.getInstanceByDom(pieChartRef.value)
    if (pieChart) {
      pieChart.dispose()
    }

    const chart = echarts.init(pieChartRef.value)
    const categoryStats: Record<string, number> = {}
    data.forEach(item => {
      categoryStats[item.courseCategory] = (categoryStats[item.courseCategory] || 0) + item.hours
    })
    const chartData = Object.entries(categoryStats).map(([name, value]) => ({ name, value }))

    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} 课时 ({d}%)'
      },
      legend: {
        bottom: '5%',
        left: 'center',
        orient: 'horizontal'
      },
      series: [{
        name: '消课时长',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: chartData
      }]
    })

    window.addEventListener('resize', () => chart.resize())
  })
}

const updateCharts = (): void => {
  initBarChart(filteredData.value)
  initPieChart(filteredData.value)
}

const initMockData = (): void => {
  const categories: CourseCategory[] = ['私教一对一', '小班团课', '瑜伽普拉提', '有氧燃脂']
  const data: ConsumptionStats[] = []

  for (let i = 0; i < 100; i++) {
    const coach = store.coaches[Math.floor(Math.random() * store.coaches.length)]
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 60))

    data.push({
      coachId: coach?.id || '',
      coachName: coach?.name || '',
      courseCategory: categories[Math.floor(Math.random() * categories.length)],
      date: date.toISOString().split('T')[0],
      hours: Math.floor(Math.random() * 4) + 1,
      count: Math.floor(Math.random() * 3) + 1
    })
  }

  statsData.value = data
}

watch([() => filters.coachId, () => filters.category, () => filters.dateRange], () => {
  // 筛选条件变化时可以自动更新图表，或者等待用户点击查询按钮
}, { deep: true })

onMounted(() => {
  if (store.coaches.length > 0) {
    initMockData()
    initBarChart(statsData.value)
    initPieChart(statsData.value)
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.mb-4 {
  margin-bottom: 16px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.label {
  color: #909399;
  font-size: 14px;
  margin: 0 0 8px 0;
}

.value {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
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

.chart-card {
  height: 420px;
}

.chart {
  width: 100%;
  height: 340px;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .card-header .el-button {
    flex: 1;
  }

  .chart-card {
    height: 380px;
  }

  .chart {
    height: 300px;
  }

  .value {
    font-size: 22px;
  }
}
</style>
