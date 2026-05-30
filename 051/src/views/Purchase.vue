<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">采购入库单据</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增采购单
      </el-button>
    </div>

    <div class="card">
      <el-tabs v-model="activeStatus" @tab-change="handleStatusChange">
        <el-tab-pane label="全部" value="" />
        <el-tab-pane label="待审核" value="pending" />
        <el-tab-pane label="已入库" value="approved" />
        <el-tab-pane label="已驳回" value="rejected" />
      </el-tabs>
    </div>

    <div class="card">
      <SearchForm v-model="filters" @search="handleSearch" @reset="handleReset">
        <el-form-item label="类型" prop="type">
          <el-select v-model="filters.type" placeholder="请选择类型" clearable style="width: 140px">
            <el-option label="正常入库" value="normal" />
            <el-option label="退货入库" value="return" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="filters.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="待审核" value="pending" />
            <el-option label="已入库" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围" prop="dateRange">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 280px"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="关键词" prop="keyword">
          <el-input v-model="filters.keyword" placeholder="采购单号/供应商" clearable style="width: 200px" />
        </el-form-item>
      </SearchForm>

      <el-table
        :data="filteredOrders"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        :empty-text="'暂无采购单据'"
      >
        <el-table-column prop="orderNo" label="采购单号" width="160" />
        <el-table-column prop="supplierName" label="供应商" min-width="150" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            {{ PurchaseTypeLabel[row.type] }}
          </template>
        </el-table-column>
        <el-table-column prop="items" label="商品数量" width="100" align="center">
          <template #default="{ row }">
            {{ row.items?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', row.status]">
              {{ PurchaseStatusLabel[row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="auditor" label="审核人" width="100" />
        <el-table-column prop="auditTime" label="审核时间" width="180">
          <template #default="{ row }">
            {{ row.auditTime ? formatDate(row.auditTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="handleApprove(row)">
              通过
            </el-button>
            <el-button v-if="row.status === 'pending'" type="danger" link size="small" @click="handleReject(row)">
              驳回
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
        class="pagination-wrapper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <FormDialog
      v-model="detailDialogVisible"
      title="采购单详情"
      mode="view"
      width="800px"
    >
      <div v-if="currentOrder">
        <el-descriptions :column="2" border style="margin-bottom: 20px">
          <el-descriptions-item label="采购单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ currentOrder.supplierName }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ PurchaseTypeLabel[currentOrder.type] }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ currentOrder.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="总金额">¥{{ currentOrder.totalAmount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <span :class="['status-tag', currentOrder.status]">
              {{ PurchaseStatusLabel[currentOrder.status] }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="审核人">{{ currentOrder.auditor || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ currentOrder.auditTime ? formatDate(currentOrder.auditTime) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ formatDate(currentOrder.createTime) }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.rejectReason" label="驳回原因" :span="2">
            <el-tag type="danger">{{ currentOrder.rejectReason }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <h4 style="margin-bottom: 12px">商品明细</h4>
        <el-table :data="currentOrder.items" border stripe size="small">
          <el-table-column prop="wineBrandName" label="商品名称" min-width="150" />
          <el-table-column prop="quantity" label="数量" width="100" align="center" />
          <el-table-column prop="unitPrice" label="单价" width="120" align="right">
            <template #default="{ row }">
              ¥{{ row.unitPrice.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120" align="right">
            <template #default="{ row }">
              ¥{{ (row.quantity * row.unitPrice).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </FormDialog>

    <el-dialog v-model="rejectDialogVisible" title="驳回采购单" width="500px">
      <el-form label-width="100px">
        <el-form-item label="驳回原因" required>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAppStore } from '@/store'
import {
  PurchaseTypeLabel,
  PurchaseStatusLabel,
  type PurchaseOrder,
  type PurchaseFilters
} from '@/types'
import SearchForm from '@/components/SearchForm.vue'
import FormDialog from '@/components/FormDialog.vue'

const appStore = useAppStore()

const loading = ref(false)
const detailDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const submitLoading = ref(false)
const activeStatus = ref('')
const currentOrder = ref<PurchaseOrder | null>(null)
const rejectReason = ref('')
const pendingOrderId = ref<string | null>(null)

const filters = reactive<PurchaseFilters>({
  type: '',
  status: '',
  keyword: '',
  startDate: '',
  endDate: ''
})

const dateRange = ref<[string, string] | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

watch(() => appStore.purchaseOrders, () => {
  pagination.total = appStore.purchaseOrders.length
}, { deep: true })

const filteredOrders = computed(() => {
  let result = [...appStore.purchaseOrders]

  if (activeStatus.value) {
    result = result.filter(item => item.status === activeStatus.value)
  }

  if (filters.type) {
    result = result.filter(item => item.type === filters.type)
  }
  if (filters.status) {
    result = result.filter(item => item.status === filters.status)
  }
  if (filters.startDate) {
    result = result.filter(item => new Date(item.createTime) >= new Date(filters.startDate!))
  }
  if (filters.endDate) {
    const endDate = new Date(filters.endDate)
    endDate.setHours(23, 59, 59, 999)
    result = result.filter(item => new Date(item.createTime) <= endDate)
  }
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    result = result.filter(item =>
      item.orderNo.toLowerCase().includes(keyword) ||
      item.supplierName.toLowerCase().includes(keyword)
    )
  }

  pagination.total = result.length
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return result.slice(start, end)
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleStatusChange = (status: string) => {
  activeStatus.value = status
  pagination.page = 1
}

const handleSearch = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    filters.startDate = dateRange.value[0]
    filters.endDate = dateRange.value[1]
  } else {
    filters.startDate = ''
    filters.endDate = ''
  }
  pagination.page = 1
}

const handleReset = () => {
  filters.type = ''
  filters.status = ''
  filters.keyword = ''
  filters.startDate = ''
  filters.endDate = ''
  dateRange.value = null
  pagination.page = 1
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

const handleAdd = () => {
  ElMessage.info('新增采购单功能开发中...')
}

const handleView = (row: PurchaseOrder) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

const handleApprove = (row: PurchaseOrder) => {
  ElMessageBox.confirm(`确认审核通过采购单 ${row.orderNo}？审核通过后将更新库存。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    appStore.approvePurchaseOrder(row.id, '管理员')
    ElMessage.success('审核通过')
  })
}

const handleReject = (row: PurchaseOrder) => {
  pendingOrderId.value = row.id
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const confirmReject = () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  if (pendingOrderId.value) {
    submitLoading.value = true
    setTimeout(() => {
      appStore.rejectPurchaseOrder(pendingOrderId.value!, rejectReason.value)
      rejectDialogVisible.value = false
      submitLoading.value = false
      ElMessage.success('驳回成功')
    }, 500)
  }
}
</script>
