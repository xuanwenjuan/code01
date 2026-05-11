<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { 
  Monitor, 
  Box, 
  Link, 
  Warning, 
  CircleCheck, 
  CircleClose,
  DataAnalysis,
  Clock
} from '@element-plus/icons-vue'
import { useAssetStore, useBorrowStore } from '@/stores'

const assetStore = useAssetStore()
const borrowStore = useBorrowStore()

const loading = ref(true)

onMounted(async () => {
  await Promise.all([
    assetStore.fetchStats(),
    borrowStore.fetchStats()
  ])
  loading.value = false
})

const assetStats = computed(() => assetStore.stats)
const borrowStats = computed(() => borrowStore.stats)

const assetCards = computed(() => [
  { 
    title: '资产总数', 
    value: assetStats.value.total, 
    icon: Monitor, 
    color: '#409EFF',
    bgColor: 'rgba(64, 158, 255, 0.1)'
  },
  { 
    title: '闲置设备', 
    value: assetStats.value.idle, 
    icon: Box, 
    color: '#67C23A',
    bgColor: 'rgba(103, 194, 58, 0.1)'
  },
  { 
    title: '使用中', 
    value: assetStats.value.inUse, 
    icon: Link, 
    color: '#E6A23C',
    bgColor: 'rgba(230, 162, 60, 0.1)'
  },
  { 
    title: '维修中', 
    value: assetStats.value.repairing, 
    icon: Warning, 
    color: '#F56C6C',
    bgColor: 'rgba(245, 108, 108, 0.1)'
  }
])

const borrowCards = computed(() => [
  { 
    title: '待审批', 
    value: borrowStats.value.pending, 
    icon: Clock, 
    color: '#E6A23C',
    bgColor: 'rgba(230, 162, 60, 0.1)'
  },
  { 
    title: '已领用', 
    value: borrowStats.value.inUse, 
    icon: CircleCheck, 
    color: '#67C23A',
    bgColor: 'rgba(103, 194, 58, 0.1)'
  },
  { 
    title: '逾期未还', 
    value: borrowStats.value.overdue, 
    icon: Warning, 
    color: '#F56C6C',
    bgColor: 'rgba(245, 108, 108, 0.1)',
    highlight: true
  },
  { 
    title: '高价值资产', 
    value: borrowStats.value.highValue, 
    icon: CircleClose, 
    color: '#909399',
    bgColor: 'rgba(144, 147, 153, 0.1)',
    highlight: borrowStats.value.highValue > 0
  }
])

const formatCurrency = (value: number): string => {
  return value.toLocaleString('zh-CN', { 
    style: 'currency', 
    currency: 'CNY',
    minimumFractionDigits: 2
  })
}
</script>

<template>
  <div class="dashboard">
    <el-skeleton :loading="loading" animated>
      <template #default>
        <div class="dashboard-header">
          <h2 class="page-title">数据概览</h2>
          <p class="page-subtitle">实时掌握企业IT资产状况</p>
        </div>
        
        <div class="stats-section">
          <h3 class="section-title">
            <el-icon><Monitor /></el-icon>
            资产统计
          </h3>
          <el-row :gutter="16" class="stats-row">
            <el-col :xs="12" :sm="12" :md="6" :lg="6" v-for="card in assetCards" :key="card.title">
              <el-card class="stats-card" :body-style="{ padding: '20px' }">
                <div class="card-content">
                  <div class="card-info">
                    <div class="card-title">{{ card.title }}</div>
                    <div class="card-value">{{ card.value }}</div>
                  </div>
                  <div class="card-icon" :style="{ backgroundColor: card.bgColor, color: card.color }">
                    <el-icon :size="28"><component :is="card.icon" /></el-icon>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        
        <el-row :gutter="16" class="info-row">
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-card class="info-card">
              <template #header>
                <div class="card-header">
                  <span><el-icon><DataAnalysis /></el-icon> 资产价值</span>
                </div>
              </template>
              <div class="value-info">
                <div class="value-label">当前资产总价值</div>
                <div class="value-amount">{{ formatCurrency(assetStats.totalValue) }}</div>
                <el-progress 
                  :percentage="Math.round((assetStats.totalValue / (assetStats.total * 5000)) * 100)" 
                  :stroke-width="8"
                  :color="{
                    '0%': '#409EFF',
                    '50%': '#67C23A',
                    '100%': '#E6A23C'
                  }"
                />
                <div class="value-tip">
                  共 {{ assetStats.total }} 台设备，平均每台约 
                  {{ assetStats.total > 0 ? formatCurrency(assetStats.totalValue / assetStats.total) : '¥0.00' }}
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-card class="info-card">
              <template #header>
                <div class="card-header">
                  <span><el-icon><Link /></el-icon> 领用统计</span>
                </div>
              </template>
              <div class="borrow-summary">
                <el-row :gutter="12">
                  <el-col :span="12" v-for="card in borrowCards" :key="card.title">
                    <div class="borrow-item" :class="{ highlight: card.highlight }">
                      <div class="borrow-icon" :style="{ backgroundColor: card.bgColor, color: card.color }">
                        <el-icon><component :is="card.icon" /></el-icon>
                      </div>
                      <div class="borrow-info">
                        <div class="borrow-count">{{ card.value }}</div>
                        <div class="borrow-label">{{ card.title }}</div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <div class="tips-section">
          <el-alert
            v-if="borrowStats.overdue > 0"
            :title="`当前有 ${borrowStats.overdue} 笔领用已逾期，请及时处理`"
            type="error"
            show-icon
            :closable="false"
            class="alert-tip"
          />
          <el-alert
            v-if="borrowStats.highValue > 0"
            :title="`当前有 ${borrowStats.highValue} 笔高价值资产在领用中，请重点关注`"
            type="warning"
            show-icon
            :closable="false"
            class="alert-tip"
          />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  .dashboard-header {
    margin-bottom: 24px;
    
    .page-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #303133;
    }
    
    .page-subtitle {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
  }
  
  .stats-section {
    margin-bottom: 24px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #303133;
      display: flex;
      align-items: center;
      
      .el-icon {
        margin-right: 8px;
      }
    }
  }
  
  .stats-row {
    .stats-card {
      border-radius: 8px;
      border: none;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      
      .card-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .card-info {
        .card-title {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }
        
        .card-value {
          font-size: 28px;
          font-weight: 700;
          color: #303133;
        }
      }
      
      .card-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  
  .info-row {
    margin-bottom: 24px;
    
    .info-card {
      border-radius: 8px;
      border: none;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      
      .card-header {
        font-weight: 600;
        display: flex;
        align-items: center;
        
        .el-icon {
          margin-right: 8px;
        }
      }
      
      .value-info {
        .value-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 12px;
        }
        
        .value-amount {
          font-size: 32px;
          font-weight: 700;
          color: #409EFF;
          margin-bottom: 20px;
        }
        
        .value-tip {
          margin-top: 12px;
          font-size: 12px;
          color: #909399;
        }
      }
      
      .borrow-summary {
        .borrow-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 8px;
          transition: all 0.3s;
          
          &.highlight {
            background-color: rgba(245, 108, 108, 0.05);
            animation: pulse 2s infinite;
          }
          
          .borrow-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
          }
          
          .borrow-info {
            .borrow-count {
              font-size: 20px;
              font-weight: 700;
              color: #303133;
            }
            
            .borrow-label {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }
  
  .tips-section {
    .alert-tip {
      margin-bottom: 12px;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .dashboard {
    .dashboard-header {
      .page-title {
        font-size: 20px;
      }
    }
    
    .stats-row {
      .stats-card {
        margin-bottom: 16px;
        
        .card-content {
          .card-info {
            .card-value {
              font-size: 22px;
            }
          }
        }
      }
    }
  }
}
</style>
