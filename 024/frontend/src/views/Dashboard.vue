<template>
  <div class="page-container">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-number">{{ productStats.total }}</div>
          <div class="stat-label">商品总数</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card blue">
          <div class="stat-number">{{ productStats.low_stock }}</div>
          <div class="stat-label">库存不足</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card orange">
          <div class="stat-number">{{ productStats.expiring }}</div>
          <div class="stat-label">临期商品</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card green">
          <div class="stat-number">{{ productStats.out_of_stock }}</div>
          <div class="stat-label">已售罄</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :md="12">
        <div class="card-wrapper">
          <div class="page-header">
            <span class="page-title">快捷操作</span>
          </div>
          <el-row :gutter="15">
            <el-col :span="12">
              <router-link to="/products">
                <div class="quick-action">
                  <el-icon class="action-icon"><Goods /></el-icon>
                  <span>商品管理</span>
                </div>
              </router-link>
            </el-col>
            <el-col :span="12">
              <router-link to="/categories">
                <div class="quick-action">
                  <el-icon class="action-icon"><Grid /></el-icon>
                  <span>分类管理</span>
                </div>
              </router-link>
            </el-col>
            <el-col :span="12">
              <router-link to="/inventory">
                <div class="quick-action">
                  <el-icon class="action-icon"><Trophy /></el-icon>
                  <span>出入库管理</span>
                </div>
              </router-link>
            </el-col>
            <el-col :span="12">
              <router-link to="/operation-logs">
                <div class="quick-action">
                  <el-icon class="action-icon"><Document /></el-icon>
                  <span>操作履历</span>
                </div>
              </router-link>
            </el-col>
          </el-row>
        </div>
      </el-col>

      <el-col :md="12">
        <div class="card-wrapper">
          <div class="page-header">
            <span class="page-title">最新操作</span>
            <router-link to="/operation-logs">
              <el-button type="primary" text>查看全部</el-button>
            </router-link>
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="log in recentLogs"
              :key="log.id"
              :timestamp="formatDate(log.created_at)"
              placement="top"
            >
              <el-card :body-style="{ padding: '12px' }" shadow="never">
                <div class="log-item">
                  <el-tag :type="getLogTagType(log.type)" size="small">{{ log.type }}</el-tag>
                  <span class="log-action">{{ log.action }}</span>
                  <span class="log-target">{{ log.target }}</span>
                </div>
                <div class="log-details">{{ log.details }}</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { productApi, logApi } from '@/api'
import { formatDate, getLogTagType } from '@/utils/helpers'
import type { OperationLog, ProductStats } from '@/types'

const productStats = reactive<ProductStats>({
  total: 0,
  low_stock: 0,
  expiring: 0,
  out_of_stock: 0
})

const recentLogs = reactive<OperationLog[]>([])

async function loadStats(): Promise<void> {
  try {
    const response = await productApi.getStats()
    if (response.success && response.data) {
      Object.assign(productStats, response.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

async function loadRecentLogs(): Promise<void> {
  try {
    const response = await logApi.getList({ page: 1, page_size: 5 })
    if (response.success && response.data) {
      recentLogs.splice(0, recentLogs.length, ...response.data)
    }
  } catch (error) {
    console.error('加载最近日志失败:', error)
  }
}

onMounted((): void => {
  loadStats()
  loadRecentLogs()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.content-row {
  margin-bottom: 20px;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 15px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 15px;
}

.quick-action:hover {
  background: #409eff;
  color: #fff;
}

.action-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.log-action {
  font-weight: 600;
}

.log-target {
  color: #606266;
}

.log-details {
  color: #909399;
  font-size: 12px;
}
</style>
