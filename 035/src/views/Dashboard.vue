<template>
  <div class="dashboard">
    <div class="stats-row">
      <div class="stat-card" @click="$router.push('/bills')">
        <div class="stat-header">
          <span class="stat-label">本月收入</span>
          <el-icon class="stat-icon income-icon"><TrendCharts /></el-icon>
        </div>
        <div class="stat-value income">¥{{ formatMoney(billStore.currentMonthIncome) }}</div>
        <div class="stat-desc">共 {{ incomeCount }} 笔</div>
      </div>
      
      <div class="stat-card" @click="$router.push('/bills')">
        <div class="stat-header">
          <span class="stat-label">本月支出</span>
          <el-icon class="stat-icon expense-icon"><Wallet /></el-icon>
        </div>
        <div class="stat-value expense">¥{{ formatMoney(billStore.currentMonthExpense) }}</div>
        <div class="stat-desc">共 {{ expenseCount }} 笔</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">本月结余</span>
          <el-icon class="stat-icon balance-icon"><Coin /></el-icon>
        </div>
        <div class="stat-value" :class="billStore.currentMonthBalance >= 0 ? 'income' : 'expense'">
          {{ billStore.currentMonthBalance >= 0 ? '+' : '' }}¥{{ formatMoney(Math.abs(billStore.currentMonthBalance)) }}
        </div>
        <div class="stat-desc">{{ billStore.currentMonthBalance >= 0 ? '资金富余' : '入不敷出' }}</div>
      </div>
      
      <div class="stat-card" @click="$router.push('/budget')">
        <div class="stat-header">
          <span class="stat-label">预算状态</span>
          <el-icon class="stat-icon budget-icon"><DataLine /></el-icon>
        </div>
        <div class="budget-status">
          <el-tag v-if="budgetStore.overBudgetCount > 0" type="danger" effect="dark">
            {{ budgetStore.overBudgetCount }} 项超支
          </el-tag>
          <el-tag v-else-if="budgetStore.warningBudgetCount > 0" type="warning" effect="dark">
            {{ budgetStore.warningBudgetCount }} 项预警
          </el-tag>
          <el-tag v-else type="success" effect="dark">
            全部正常
          </el-tag>
        </div>
        <div class="stat-desc">已设置 {{ budgetStore.currentMonthBudgets.length }} 项预算</div>
      </div>
    </div>
    
    <div class="content-row">
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">收支趋势</span>
          <el-date-picker
            v-model="selectedMonth"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            size="small"
            @change="handleMonthChange"
          />
        </div>
        <div ref="trendChartRef" class="chart-container"></div>
      </div>
      
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">支出分类占比</span>
        </div>
        <div ref="pieChartRef" class="chart-container"></div>
      </div>
    </div>
    
    <div class="content-row">
      <div class="list-card">
        <div class="card-header">
          <span class="card-title">最近账单</span>
          <el-button type="primary" link @click="$router.push('/bills')">查看全部</el-button>
        </div>
        <el-table :data="recentBills" style="width: 100%" size="small">
          <el-table-column label="类型" width="80">
            <template #default="{ row }">
              <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small">
                {{ row.type === 'income' ? '收入' : '支出' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="分类" width="100">
            <template #default="{ row }">
              {{ getCategoryName(row.categoryId) }}
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120" align="right">
            <template #default="{ row }">
              <span :class="row.type === 'income' ? 'text-success' : 'text-danger'">
                {{ row.type === 'income' ? '+' : '-' }}¥{{ formatMoney(row.amount) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="日期" width="120">
            <template #default="{ row }">
              {{ row.date }}
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.note || '-' }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="list-card">
        <div class="card-header">
          <span class="card-title">操作动态</span>
          <el-button type="primary" link @click="$router.push('/logs')">查看全部</el-button>
        </div>
        <el-timeline>
          <el-timeline-item
            v-for="log in logStore.recentLogs"
            :key="log.id"
            :timestamp="formatDateTime(log.timestamp)"
            placement="top"
            :type="getLogTypeColor(log.type)"
          >
            <div class="log-item">
              <el-tag :type="getLogTypeColor(log.type)" size="small" class="log-tag">
                {{ OPERATION_TYPE_LABELS[log.type] }}
              </el-tag>
              <span class="log-desc">{{ log.description }}</span>
            </div>
            <div v-if="log.detail" class="log-detail text-light text-ellipsis" :title="log.detail">
              {{ log.detail }}
            </div>
          </el-timeline-item>
          <el-empty v-if="logStore.recentLogs.length === 0" :image-size="80" description="暂无操作记录" />
        </el-timeline>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useBillStore } from '@/stores/bill'
import { useBudgetStore } from '@/stores/budget'
import { useLogStore } from '@/stores/log'
import { OPERATION_TYPE_LABELS } from '@/constants'
import { formatMoney, formatDateTime, getCategoryName, getCurrentMonth } from '@/utils'
import type { OperationType } from '@/types'

const billStore = useBillStore()
const budgetStore = useBudgetStore()
const logStore = useLogStore()

const selectedMonth = ref(getCurrentMonth())
const trendChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const recentBills = computed(() => billStore.bills.slice(0, 10))
const incomeCount = computed(() => 
  billStore.currentMonthBills.filter(b => b.type === 'income').length
)
const expenseCount = computed(() => 
  billStore.currentMonthBills.filter(b => b.type === 'expense').length
)

function getLogTypeColor(type: OperationType): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    add_bill: 'success',
    edit_bill: 'primary',
    delete_bill: 'danger',
    update_budget: 'warning',
    adjust_budget: 'info',
    add_budget: 'success',
    add_note: 'info',
  }
  return colorMap[type] || 'info'
}

function handleMonthChange(month: string): void {
  billStore.setCurrentMonth(month)
  nextTick(() => {
    initCharts()
  })
}

function initTrendChart(): void {
  if (!trendChartRef.value) return
  
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  
  const dates = billStore.dailyTrend.map(t => t.date.slice(5))
  const incomeData = billStore.dailyTrend.map(t => t.income)
  const expenseData = billStore.dailyTrend.map(t => t.expense)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const p = params as Array<{ axisValue: string; seriesName: string; value: number }>
        return `${p[0].axisValue}<br/>
          ${p[0].seriesName}: ¥${p[0].value.toLocaleString()}<br/>
          ${p[1].seriesName}: ¥${p[1].value.toLocaleString()}`
      },
    },
    legend: {
      data: ['收入', '支出'],
      right: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 10000) return (value / 10000) + 'w'
          if (value >= 1000) return (value / 1000) + 'k'
          return value.toString()
        },
      },
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: incomeData,
        itemStyle: { color: '#67c23a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' },
          ]),
        },
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        data: expenseData,
        itemStyle: { color: '#f56c6c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' },
          ]),
        },
      },
    ],
  }
  
  trendChart.setOption(option)
}

function initPieChart(): void {
  if (!pieChartRef.value) return
  
  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }
  
  const data = billStore.categoryStats.map(s => ({
    name: s.categoryName,
    value: s.amount,
    itemStyle: { color: s.color },
  }))
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data,
      },
    ],
  }
  
  pieChart.setOption(option)
}

function initCharts(): void {
  initTrendChart()
  initPieChart()
}

function handleResize(): void {
  trendChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initCharts()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  trendChart?.dispose()
  pieChart?.dispose()
  window.removeEventListener('resize', handleResize)
})

watch(() => billStore.categoryStats, () => {
  nextTick(() => {
    initPieChart()
  })
}, { deep: true })

watch(() => billStore.dailyTrend, () => {
  nextTick(() => {
    initTrendChart()
  })
}, { deep: true })
</script>

<style scoped lang="scss">
.dashboard {
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;
    
    @media screen and (max-width: $breakpoint-desktop) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media screen and (max-width: $breakpoint-tablet) {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    
    .stat-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
      }
      
      .stat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        
        .stat-label {
          color: #909399;
          font-size: 14px;
        }
        
        .stat-icon {
          font-size: 20px;
          padding: 8px;
          border-radius: 8px;
          
          &.income-icon {
            background: rgba(103, 194, 58, 0.1);
            color: #67c23a;
          }
          
          &.expense-icon {
            background: rgba(245, 108, 108, 0.1);
            color: #f56c6c;
          }
          
          &.balance-icon {
            background: rgba(64, 158, 255, 0.1);
            color: #409eff;
          }
          
          &.budget-icon {
            background: rgba(230, 162, 60, 0.1);
            color: #e6a23c;
          }
        }
      }
      
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 8px;
        
        &.income { color: #67c23a; }
        &.expense { color: #f56c6c; }
      }
      
      .stat-desc {
        color: #909399;
        font-size: 12px;
      }
    }
  }
  
  .content-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 20px;
    
    @media screen and (max-width: $breakpoint-desktop) {
      grid-template-columns: 1fr;
    }
    
    @media screen and (max-width: $breakpoint-tablet) {
      gap: 12px;
    }
    
    .chart-card,
    .list-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      
      @media screen and (max-width: $breakpoint-tablet) {
        padding: 16px;
      }
    }
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .chart-container {
      height: 300px;
      
      @media screen and (max-width: $breakpoint-tablet) {
        height: 250px;
      }
    }
  }
  
  .log-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    
    .log-tag {
      flex-shrink: 0;
    }
    
    .log-desc {
      color: #606266;
    }
  }
  
  .log-detail {
    font-size: 12px;
    max-width: 200px;
  }
}
</style>
