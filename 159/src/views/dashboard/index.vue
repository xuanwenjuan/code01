<template>
  <div class="page-container">
    <PageLoading :loading="loading" />
    
    <div class="statistics-row">
      <DataCard
        v-for="item in statistics"
        :key="item.title"
        :title="item.title"
        :value="item.value"
        :icon="item.icon"
        :color="item.color"
        :trend="item.trend"
      />
    </div>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <div class="card-wrapper mb-20">
          <div class="card-header">
            <h3>待办事项</h3>
            <el-button type="primary" link @click="router.push('/approval/pending')">
              查看全部 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div v-if="todos.length" class="todo-list">
            <div v-for="todo in todos" :key="todo.id" class="todo-item">
              <el-checkbox v-model="todo.status" :true-value="'done'" :false-value="'pending'">
                <span :class="{ 'todo-done': todo.status === 'done' }">{{ todo.title }}</span>
              </el-checkbox>
              <div class="todo-meta">
                <el-tag :type="priorityType(todo.priority)" size="small">{{ priorityText(todo.priority) }}</el-tag>
                <span class="deadline">截止：{{ todo.deadline }}</span>
              </div>
            </div>
          </div>
          <EmptyState v-else description="暂无待办事项" />
        </div>
        
        <div class="card-wrapper">
          <div class="card-header">
            <h3>公告通知</h3>
            <el-button type="primary" link>查看全部 <el-icon><ArrowRight /></el-icon></el-button>
          </div>
          <div v-if="notices.length" class="notice-list">
            <div v-for="notice in notices" :key="notice.id" class="notice-item">
              <el-icon :color="notice.type === 'notice' ? '#409EFF' : '#E6A23C'">
                <Bell v-if="notice.type === 'notice'" />
                <Warning v-else />
              </el-icon>
              <span class="notice-title">
                <el-tag v-if="notice.isTop" type="danger" size="small" effect="dark">置顶</el-tag>
                {{ notice.title }}
              </span>
              <span class="notice-time">{{ notice.createTime }}</span>
            </div>
          </div>
          <EmptyState v-else description="暂无公告通知" />
        </div>
      </el-col>
      
      <el-col :span="8">
        <div class="card-wrapper mb-20">
          <div class="card-header">
            <h3>快捷功能</h3>
          </div>
          <div class="quick-links">
            <div
              v-for="link in quickLinks"
              :key="link.title"
              class="quick-item"
              @click="router.push(link.path)"
            >
              <div class="quick-icon" :style="{ backgroundColor: link.color + '20', color: link.color }">
                <el-icon :size="28"><component :is="link.icon" /></el-icon>
              </div>
              <span>{{ link.title }}</span>
            </div>
          </div>
        </div>
        
        <div class="card-wrapper mb-20">
          <div class="card-header">
            <h3>今日日程</h3>
            <el-button type="primary" link @click="router.push('/profile/schedule')">
              管理 <el-icon><Setting /></el-icon>
            </el-button>
          </div>
          <div v-if="schedules.length" class="schedule-list">
            <div v-for="item in schedules" :key="item.id" class="schedule-item">
              <div class="schedule-time">{{ item.time }}</div>
              <div class="schedule-content">
                <p class="schedule-title">{{ item.title }}</p>
                <p class="schedule-location"><el-icon><Location /></el-icon> {{ item.location }}</p>
              </div>
            </div>
          </div>
          <EmptyState v-else description="今日暂无日程" />
        </div>
        
        <div class="card-wrapper">
          <div class="card-header">
            <h3>部门人员分布</h3>
          </div>
          <div ref="pieChartRef" class="pie-chart"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { mockStatistics, mockTodos, mockNotices, mockQuickLinks, mockSchedule, mockChartData } from '@/mock/dashboard'
import DataCard from '@/components/DataCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageLoading from '@/components/PageLoading.vue'

const router = useRouter()
const loading = ref(false)
const pieChartRef = ref()
let pieChart = null

const statistics = ref([])
const todos = ref([])
const notices = ref([])
const quickLinks = ref([])
const schedules = ref([])
const chartData = ref(null)

const priorityText = (p) => ({ high: '高优先级', medium: '中优先级', low: '低优先级' }[p])
const priorityType = (p) => ({ high: 'danger', medium: 'warning', low: 'info' }[p])

const initPieChart = () => {
  if (!pieChartRef.value || !chartData.value) return
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 16, fontWeight: 'bold' }
      },
      data: chartData.value.deptData
    }]
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const [stats, todoList, noticeList, links, scheduleList, charts] = await Promise.all([
      mockStatistics(),
      mockTodos(),
      mockNotices(),
      mockQuickLinks(),
      mockSchedule(),
      mockChartData()
    ])
    statistics.value = stats
    todos.value = todoList
    notices.value = noticeList
    quickLinks.value = links
    schedules.value = scheduleList
    chartData.value = charts
    initPieChart()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', () => pieChart?.resize())
})

onUnmounted(() => {
  pieChart?.dispose()
  window.removeEventListener('resize', () => pieChart?.resize())
})
</script>

<style scoped lang="scss">
.statistics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .statistics-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }
}

.todo-list {
  .todo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .todo-done {
      text-decoration: line-through;
      color: #c0c4cc;
    }
  }
  
  .todo-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .deadline {
      font-size: 12px;
      color: #909399;
    }
  }
}

.notice-list {
  .notice-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .notice-title {
      flex: 1;
      font-size: 14px;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .notice-time {
      font-size: 12px;
      color: #909399;
      flex-shrink: 0;
    }
  }
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: #f5f7fa;
    transform: translateY(-2px);
  }
  
  .quick-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  span {
    font-size: 13px;
    color: #606266;
  }
}

.schedule-list {
  .schedule-item {
    display: flex;
    gap: 15px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .schedule-time {
      flex-shrink: 0;
      font-size: 13px;
      color: #409EFF;
      font-weight: 500;
      padding-top: 2px;
    }
    
    .schedule-content {
      .schedule-title {
        font-size: 14px;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .schedule-location {
        font-size: 12px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

.pie-chart {
  height: 250px;
}
</style>
