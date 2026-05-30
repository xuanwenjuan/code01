<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="flex-between">
          <span>报关单业务管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增报关单
          </el-button>
        </div>
      </template>

      <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

      <el-table
        :data="tableData"
        stripe
        v-loading="loading"
        row-key="id"
        class="mt-20 optimized-table"
        :header-cell-style="{ background: '#f5f7fa', fontWeight: '600' }"
        :cell-style="{ padding: '10px 12px' }"
      >
        <el-table-column prop="declarationNo" label="报关单号" width="160" />
        <el-table-column prop="customerName" label="客户企业" min-width="150" show-overflow-tooltip />
        <el-table-column prop="productCategory" label="商品类别" width="120" />
        <el-table-column prop="productName" label="商品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="productCode" label="商品编码" width="120" />
        <el-table-column label="数量" width="120" align="right">
          <template #default="{ row }">
            {{ row.quantity }} {{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120" align="right">
          <template #default="{ row }">
            {{ CURRENCY_MAP[row.currency as keyof typeof CURRENCY_MAP]?.symbol || '¥' }} {{ row.amount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="申报进度" width="350">
          <template #default="{ row }">
            <el-steps :active="row.currentStep" finish-status="success" size="small" align-center>
              <el-step v-for="(step, idx) in DECLARATION_STEPS" :key="idx" :title="step.title" />
            </el-steps>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="DECLARATION_STATUS_MAP[row.status].type" size="small">
              {{ DECLARATION_STATUS_MAP[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
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

    <DeclarationForm
      v-model:visible="formVisible"
      :declaration="currentDeclaration"
      :customers="allCustomers"
      @submit="handleSubmit"
    />

    <el-dialog v-model="detailVisible" title="报关单详情" width="700px" destroy-on-close>
      <el-descriptions v-if="detailData" :column="2" border>
        <el-descriptions-item label="报关单号" :span="2">
          {{ detailData.declarationNo }}
        </el-descriptions-item>
        <el-descriptions-item label="客户企业">{{ detailData.customerName }}</el-descriptions-item>
        <el-descriptions-item label="商品类别">{{ detailData.productCategory }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ detailData.productName }}</el-descriptions-item>
        <el-descriptions-item label="商品编码">{{ detailData.productCode }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ detailData.quantity }} {{ detailData.unit }}</el-descriptions-item>
        <el-descriptions-item label="币制">{{ CURRENCY_MAP[detailData.currency as keyof typeof CURRENCY_MAP]?.label || detailData.currency }}</el-descriptions-item>
        <el-descriptions-item label="金额">
          {{ CURRENCY_MAP[detailData.currency as keyof typeof CURRENCY_MAP]?.symbol || '¥' }} {{ detailData.amount.toLocaleString() }}
        </el-descriptions-item>
        <el-descriptions-item label="申报进度" :span="2">
          <el-steps :active="detailData.currentStep" finish-status="success" size="small" align-center>
            <el-step v-for="(step, idx) in DECLARATION_STEPS" :key="idx" :title="step.title" />
          </el-steps>
        </el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="DECLARATION_STATUS_MAP[detailData.status].type">
            {{ DECLARATION_STATUS_MAP[detailData.status].label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作员">{{ detailData.operator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item v-if="detailData.submitTime" label="申报时间" :span="2">
          {{ detailData.submitTime }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.completeTime" label="办结时间" :span="2">
          {{ detailData.completeTime }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-space>
          <el-form v-if="detailData && detailData.status !== 'completed'" inline label-width="80px">
            <el-form-item label="变更状态">
              <el-select v-model="newStatus" placeholder="选择新状态">
                <el-option label="草稿" value="draft" />
                <el-option label="已申报" value="submitted" />
                <el-option label="审核中" value="reviewing" />
                <el-option label="查验中" value="inspecting" />
                <el-option label="已放行" value="released" />
                <el-option label="已办结" value="completed" />
                <el-option label="已驳回" value="rejected" />
              </el-select>
            </el-form-item>
            <el-button type="primary" @click="handleStatusUpdate" :disabled="!newStatus || newStatus === detailData.status">
              更新状态
            </el-button>
          </el-form>
          <el-button @click="detailVisible = false">关闭</el-button>
        </el-space>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useDeclarationStore } from '@/stores/declaration'
import { useCustomerStore } from '@/stores/customer'
import type { CustomsDeclaration, Customer } from '@/types'
import { DECLARATION_STATUS_MAP, CURRENCY_MAP, DECLARATION_STEPS } from '@/types'
import type { SearchField } from '@/types'
import DeclarationForm from '@/components/DeclarationForm.vue'
import SearchForm from '@/components/SearchForm.vue'

const declarationStore = useDeclarationStore()
const customerStore = useCustomerStore()

const loading = ref(false)
const formVisible = ref(false)
const detailVisible = ref(false)
const currentDeclaration = ref<CustomsDeclaration | null>(null)
const detailData = ref<CustomsDeclaration | null>(null)
const newStatus = ref<string>('')
const allCustomers = ref<Customer[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref<CustomsDeclaration[]>([])

const searchFields: SearchField[] = [
  { label: '报关单号', prop: 'declarationNo', type: 'input', placeholder: '请输入报关单号' },
  { label: '客户企业', prop: 'customerName', type: 'input', placeholder: '请输入客户名称' },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    options: [
      { label: '草稿', value: 'draft' },
      { label: '已申报', value: 'submitted' },
      { label: '审核中', value: 'reviewing' },
      { label: '查验中', value: 'inspecting' },
      { label: '已放行', value: 'released' },
      { label: '已办结', value: 'completed' },
      { label: '已驳回', value: 'rejected' }
    ]
  }
]

const handleSearch = async (params: Record<string, unknown> = {}) => {
  loading.value = true
  try {
    const result = await declarationStore.fetchDeclarations({
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

const handleAdd = () => {
  currentDeclaration.value = null
  formVisible.value = true
}

const handleEdit = (row: CustomsDeclaration) => {
  currentDeclaration.value = { ...row }
  formVisible.value = true
}

const handleView = async (row: CustomsDeclaration) => {
  const detail = await declarationStore.getDeclarationById(row.id)
  detailData.value = detail
  detailVisible.value = true
}

const handleSubmit = async (data: Omit<CustomsDeclaration, 'id' | 'createTime'>) => {
  if (currentDeclaration.value?.id) {
    await declarationStore.updateDeclaration(currentDeclaration.value.id, data)
    ElMessage.success('编辑成功')
  } else {
    await declarationStore.addDeclaration(data)
    ElMessage.success('新增成功')
  }
  handleSearch()
}

const handleStatusUpdate = async () => {
  if (!detailData.value || !newStatus.value) return
  
  const status = newStatus.value as DeclarationStatus
  await declarationStore.updateDeclaration(detailData.value.id, {
    status,
    currentStep: DECLARATION_STATUS_MAP[status]?.step || 0
  })
  
  ElMessage.success('状态更新成功')
  newStatus.value = ''
  handleView(detailData.value)
  handleSearch()
}

onMounted(async () => {
  handleSearch()
  const customerResult = await customerStore.fetchCustomers({ page: 1, pageSize: 1000 })
  allCustomers.value = customerResult.list
})
</script>

<style lang="scss" scoped>
.mt-20 {
  margin-top: 20px;
}
</style>
