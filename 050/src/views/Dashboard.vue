<template>
  <div class="dashboard">
    <el-row :gutter="20" class="mb-20">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #409eff">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ declarationStats.total }}</div>
              <div class="stat-label">报关单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon><Edit /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ declarationStats.draft }}</div>
              <div class="stat-label">待申报</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ declarationStats.reviewing }}</div>
              <div class="stat-label">审核中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ expiringCustomers.length }}</div>
              <div class="stat-label">资质即将到期</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" title="最近报关单">
          <el-table :data="recentDeclarations" stripe>
            <el-table-column prop="declarationNo" label="报关单号" width="160" />
            <el-table-column prop="customerName" label="客户企业" show-overflow-tooltip />
            <el-table-column prop="productName" label="商品名称" show-overflow-tooltip />
            <el-table-column prop="amount" label="金额(元)" width="120">
              <template #default="{ row }">
                {{ row.amount.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" title="资质到期预警">
          <el-empty v-if="expiringCustomers.length === 0" description="暂无即将到期的资质" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="customer in expiringCustomers"
              :key="customer.id"
              :timestamp="customer.validEnd"
              placement="top"
              type="warning"
            >
              <div class="warning-item">
                <div class="warning-name">{{ customer.name }}</div>
                <div class="warning-desc">{{ customer.qualification }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24">
        <el-card shadow="hover" title="结算统计">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="8">
              <div class="settlement-stat">
                <div class="settlement-label">待结算金额</div>
                <div class="settlement-value pending">
                  ¥ {{ settlementStats.pendingAmount.toLocaleString() }}
                </div>
                <div class="settlement-count">{{ settlementStats.pendingCount }} 笔</div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="8">
              <div class="settlement-stat">
                <div class="settlement-label">已结算金额</div>
                <div class="settlement-value settled">
                  ¥ {{ settlementStats.settledAmount.toLocaleString() }}
                </div>
                <div class="settlement-count">{{ settlementStats.settledCount }} 笔</div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="8">
              <div class="settlement-stat">
                <div class="settlement-label">总金额</div>
                <div class="settlement-value total">
                  ¥ {{ settlementStats.totalAmount.toLocaleString() }}
                </div>
                <div class="settlement-count">{{ settlementStats.total }} 笔</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeclarationStore } from '@/stores/declaration'
import { useCustomerStore } from '@/stores/customer'
import { useSettlementStore } from '@/stores/settlement'
import type { CustomsDeclaration, Customer } from '@/types'

const declarationStore = useDeclarationStore()
const customerStore = useCustomerStore()
const settlementStore = useSettlementStore()

const declarationStats = ref({
  total: 0,
  draft: 0,
  reviewing: 0,
  completed: 0
})

const expiringCustomers = ref<Customer[]>([])
const recentDeclarations = ref<CustomsDeclaration[]>([])

const settlementStats = ref({
  total: 0,
  pendingCount: 0,
  settledCount: 0,
  pendingAmount: 0,
  settledAmount: 0,
  totalAmount: 0
})

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    submitted: 'warning',
    reviewing: 'warning',
    inspecting: 'warning',
    released: 'success',
    completed: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    submitted: '已申报',
    reviewing: '审核中',
    inspecting: '查验中',
    released: '已放行',
    completed: '已办结',
    rejected: '已驳回'
  }
  return map[status] || status
}

onMounted(async () => {
  const decStats = await declarationStore.getStatistics()
  declarationStats.value = decStats

  const expiring = await customerStore.getExpiringCustomers()
  expiringCustomers.value = expiring

  const decResult = await declarationStore.fetchDeclarations({ page: 1, pageSize: 5 })
  recentDeclarations.value = decResult.list

  const setStats = await settlementStore.getStatistics()
  settlementStats.value = setStats
})
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
}

.stat-item {
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

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.warning-item {
  .warning-name {
    font-weight: 500;
    color: #303133;
    margin-bottom: 3px;
  }
  .warning-desc {
    font-size: 12px;
    color: #909399;
  }
}

.settlement-stat {
  text-align: center;
  padding: 10px;

  .settlement-label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }

  .settlement-value {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 5px;

    &.pending {
      color: #e6a23c;
    }
    &.settled {
      color: #67c23a;
    }
    &.total {
      color: #409eff;
    }
  }

  .settlement-count {
    font-size: 12px;
    color: #909399;
  }
}

.mt-20 {
  margin-top: 20px;
}
</style>
