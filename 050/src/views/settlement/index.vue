<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="flex-between">
          <span>费用对账结算管理</span>
        </div>
      </template>

      <el-row :gutter="20" class="mb-20">
        <el-col :xs="24" :sm="8">
          <div class="summary-card pending">
            <div class="summary-label">待结算金额</div>
            <div class="summary-value">¥ {{ stats.pendingAmount.toLocaleString() }}</div>
            <div class="summary-count">{{ stats.pendingCount }} 笔</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="summary-card settled">
            <div class="summary-label">已结算金额</div>
            <div class="summary-value">¥ {{ stats.settledAmount.toLocaleString() }}</div>
            <div class="summary-count">{{ stats.settledCount }} 笔</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="summary-card total">
            <div class="summary-label">总金额</div>
            <div class="summary-value">¥ {{ stats.totalAmount.toLocaleString() }}</div>
            <div class="summary-count">{{ stats.total }} 笔</div>
          </div>
        </el-col>
      </el-row>

      <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

      <el-table :data="tableData" stripe v-loading="loading" class="mt-20">
        <el-table-column prop="settlementNo" label="结算单号" width="160" />
        <el-table-column prop="customerName" label="客户企业" min-width="150" show-overflow-tooltip />
        <el-table-column prop="month" label="结算月份" width="120" />
        <el-table-column prop="serviceFee" label="报关服务费" width="120" align="right">
          <template #default="{ row }">
            ¥ {{ row.serviceFee.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="portFee" label="港杂费用" width="120" align="right">
          <template #default="{ row }">
            ¥ {{ row.portFee.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="taxFee" label="税费明细" width="120" align="right">
          <template #default="{ row }">
            ¥ {{ row.taxFee.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="120" align="right">
          <template #default="{ row }">
            <span class="total-amount">¥ {{ row.totalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="SETTLEMENT_STATUS_MAP[row.status].type" size="small">
              {{ SETTLEMENT_STATUS_MAP[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">预览</el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="success"
              size="small"
              @click="handleSettle(row)"
            >
              结算
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="mt-20"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </el-card>

    <el-dialog v-model="previewVisible" title="账单预览" width="600px" destroy-on-close>
      <div v-if="previewData" class="preview-content">
        <div class="preview-header">
          <div class="preview-title">费用结算单</div>
          <div class="preview-no">单号：{{ previewData.settlementNo }}</div>
        </div>
        <el-descriptions :column="2" border class="mb-20">
          <el-descriptions-item label="客户企业" :span="2">
            {{ previewData.customerName }}
          </el-descriptions-item>
          <el-descriptions-item label="结算月份">{{ previewData.month }}</el-descriptions-item>
          <el-descriptions-item label="操作员">{{ previewData.operator }}</el-descriptions-item>
          <el-descriptions-item label="报关服务费" class="text-right">
            ¥ {{ previewData.serviceFee.toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="港杂费用" class="text-right">
            ¥ {{ previewData.portFee.toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="税费明细" class="text-right">
            ¥ {{ previewData.taxFee.toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="总金额" class="text-right total-amount">
            ¥ {{ previewData.totalAmount.toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="SETTLEMENT_STATUS_MAP[previewData.status].type">
              {{ SETTLEMENT_STATUS_MAP[previewData.status].label }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ previewData.createTime }}</el-descriptions-item>
          <el-descriptions-item v-if="previewData.settleTime" label="结算时间" :span="2">
            {{ previewData.settleTime }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSettlementStore } from '@/stores/settlement'
import type { FeeSettlement } from '@/types'
import { SETTLEMENT_STATUS_MAP } from '@/types'
import type { SearchField } from '@/types'
import SearchForm from '@/components/SearchForm.vue'

const settlementStore = useSettlementStore()

const loading = ref(false)
const previewVisible = ref(false)
const previewData = ref<FeeSettlement | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref<FeeSettlement[]>([])

const stats = reactive({
  total: 0,
  pendingCount: 0,
  settledCount: 0,
  pendingAmount: 0,
  settledAmount: 0,
  totalAmount: 0
})

const searchFields: SearchField[] = [
  { label: '结算单号', prop: 'settlementNo', type: 'input', placeholder: '请输入结算单号' },
  { label: '客户企业', prop: 'customerName', type: 'input', placeholder: '请输入客户名称' },
  { label: '结算月份', prop: 'month', type: 'month', placeholder: '选择月份' },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    options: [
      { label: '待结算', value: 'pending' },
      { label: '已结算', value: 'settled' }
    ]
  },
  { label: '最小金额', prop: 'minAmount', type: 'input', placeholder: '请输入最小金额' },
  { label: '最大金额', prop: 'maxAmount', type: 'input', placeholder: '请输入最大金额' }
]

const handleSearch = async (params: Record<string, unknown> = {}) => {
  loading.value = true
  try {
    const result = await settlementStore.fetchSettlements({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...params
    })
    tableData.value = result.list
    pagination.total = result.total
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  pagination.page = 1
  handleSearch()
}

const handleView = (row: FeeSettlement) => {
  previewData.value = { ...row }
  previewVisible.value = true
}

const handleSettle = async (row: FeeSettlement) => {
  try {
    await ElMessageBox.confirm(
      `确认完成该笔结算吗？\n结算单号：${row.settlementNo}\n总金额：¥ ${row.totalAmount.toLocaleString()}`,
      '提示',
      {
        confirmButtonText: '确认结算',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await settlementStore.updateSettlement(row.id, {
      status: 'settled',
      settleTime: new Date().toLocaleString()
    })
    ElMessage.success('结算成功')
    handleSearch()
    loadStats()
  } catch {
    // 取消结算
  }
}

const loadStats = async () => {
  const data = await settlementStore.getStatistics()
  Object.assign(stats, data)
}

onMounted(() => {
  handleSearch()
  loadStats()
})
</script>

<style lang="scss" scoped>
.summary-card {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: #fff;

  &.pending {
    background: linear-gradient(135deg, #e6a23c 0%, #f5a623 100%);
  }

  &.settled {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  }

  &.total {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  }

  .summary-label {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 10px;
  }

  .summary-value {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .summary-count {
    font-size: 12px;
    opacity: 0.8;
  }
}

.total-amount {
  font-weight: bold;
  color: #409eff;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.preview-content {
  .preview-header {
    text-align: center;
    margin-bottom: 20px;

    .preview-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .preview-no {
      font-size: 14px;
      color: #909399;
    }
  }
}

.text-right {
  text-align: right;
}
</style>
