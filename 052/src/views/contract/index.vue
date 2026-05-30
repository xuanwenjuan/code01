<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">方案报价合同管理</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增合同
      </el-button>
    </div>

    <el-card>
      <SearchForm 
        :initial-values="{ contractNo: '', customerName: '', status: '', designerId: '', minAmount: null, maxAmount: null }"
        @search="handleSearch"
        @reset="handleReset"
      >
        <el-form-item label="合同编号">
          <el-input v-model="searchForm.contractNo" placeholder="请输入合同编号" clearable />
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户姓名" clearable />
        </el-form-item>
        <el-form-item label="设计师">
          <el-select v-model="searchForm.designerId" placeholder="请选择设计师" clearable>
            <el-option 
              v-for="designer in designers" 
              :key="designer.id" 
              :label="designer.name" 
              :value="designer.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待确认" value="pending" />
            <el-option label="已签约" value="signed" />
            <el-option label="已作废" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额范围">
          <div class="amount-range">
            <el-input-number 
              v-model="searchForm.minAmount" 
              :min="0" 
              :precision="2" 
              placeholder="最小金额"
              style="width: 140px;"
              @change="handleAmountChange"
            />
            <span class="amount-separator">至</span>
            <el-input-number 
              v-model="searchForm.maxAmount" 
              :min="0" 
              :precision="2" 
              placeholder="最大金额"
              style="width: 140px;"
              @change="handleAmountChange"
            />
          </div>
        </el-form-item>
      </SearchForm>

      <div class="contract-stats">
        <el-statistic title="合同总数" :value="contractStore.contracts.length" class="stat-item" />
        <el-statistic title="待确认" :value="getContractCountByStatus('pending')" class="stat-item pending">
          <template #prefix>
            <el-icon><Clock /></el-icon>
          </template>
        </el-statistic>
        <el-statistic title="已签约" :value="getContractCountByStatus('signed')" class="stat-item signed">
          <template #prefix>
            <el-icon><CircleCheck /></el-icon>
          </template>
        </el-statistic>
        <el-statistic title="已作废" :value="getContractCountByStatus('cancelled')" class="stat-item cancelled">
          <template #prefix>
            <el-icon><CircleClose /></el-icon>
          </template>
        </el-statistic>
        <el-statistic title="合同总金额" :value="totalAmount" class="stat-item total-amount" :precision="2">
          <template #suffix>元</template>
        </el-statistic>
      </div>

      <el-table 
        :data="paginatedContracts" 
        border 
        stripe 
        class="mt-4"
        v-loading="contractStore.loading"
        :row-class-name="getTableRowClassName"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="contractNo" label="合同编号" width="140" />
        <el-table-column prop="orderNo" label="关联订单" width="140" />
        <el-table-column prop="customerName" label="客户姓名" width="120" />
        <el-table-column prop="customerPhone" label="联系电话" width="140" />
        <el-table-column prop="designerName" label="设计师" width="120" />
        <el-table-column prop="totalAmount" label="总金额(元)" width="130" sortable="custom">
          <template #default="{ row }">
            {{ row.totalAmount?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="discount" label="折扣" width="100">
          <template #default="{ row }">
            {{ row.discount ? (row.discount * 10).toFixed(1) + '折' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="finalAmount" label="最终金额(元)" width="140" sortable="custom">
          <template #default="{ row }">
            <span class="final-amount">{{ row.finalAmount?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="CONTRACT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="warning" size="small" @click="handleStatusChange(row)">状态</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="filteredContracts.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <FormDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑合同' : '新增合同'"
      width="700px"
      :form-data="formData"
      :rules="formRules"
      @submit="handleSubmit"
    >
      <el-form-item label="客户姓名" prop="customerName">
        <el-input v-model="formData.customerName" placeholder="请输入客户姓名" />
      </el-form-item>
      <el-form-item label="联系电话" prop="customerPhone">
        <el-input v-model="formData.customerPhone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="关联订单" prop="orderId">
        <el-select v-model="formData.orderId" placeholder="请选择订单" style="width: 100%" @change="handleOrderChange">
          <el-option
            v-for="order in orders"
            :key="order.id"
            :label="`${order.orderNo} - ${order.customerName}`"
            :value="order.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设计师" prop="designerId">
        <el-select v-model="formData.designerId" placeholder="请选择设计师" style="width: 100%" @change="handleDesignerChange">
          <el-option
            v-for="designer in designers"
            :key="designer.id"
            :label="designer.name"
            :value="designer.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="合同明细">
        <div class="contract-items">
          <el-table :data="formData.items" border size="small">
            <el-table-column prop="name" label="项目名称" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.name" size="small" placeholder="请输入项目名称" />
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100">
              <template #default="{ row }">
                <el-input-number v-model="row.quantity" :min="1" size="small" style="width: 100%" @change="calculateTotal" />
              </template>
            </el-table-column>
            <el-table-column prop="unitPrice" label="单价(元)" width="140">
              <template #default="{ row }">
                <el-input-number v-model="row.unitPrice" :min="0" :precision="2" size="small" style="width: 100%" @change="calculateTotal" />
              </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="小计(元)" width="130">
              <template #default="{ row }">
                {{ (row.quantity * row.unitPrice).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="removeItem($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" size="small" class="add-item-btn" @click="addItem">+ 添加项目</el-button>
        </div>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="总金额">
            <span class="amount-text">{{ formData.totalAmount?.toFixed(2) || '0.00' }} 元</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="折扣" prop="discount">
            <el-slider 
              v-model="formData.discount" 
              :min="0.1" 
              :max="1" 
              :step="0.1" 
              :show-tooltip="true"
              @change="calculateTotal"
            />
            <span class="discount-text">{{ formData.discount ? (formData.discount * 10).toFixed(1) + '折' : '-' }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="最终金额">
        <span class="final-amount-text">{{ formData.finalAmount?.toFixed(2) || '0.00' }} 元</span>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="pending">待确认</el-radio>
          <el-radio label="signed">已签约</el-radio>
          <el-radio label="cancelled">已作废</el-radio>
        </el-radio-group>
      </el-form-item>
    </FormDialog>

    <el-dialog v-model="viewDialogVisible" title="合同详情" width="700px">
      <el-descriptions :column="2" border class="mb-4">
        <el-descriptions-item label="合同编号">{{ currentContract?.contractNo }}</el-descriptions-item>
        <el-descriptions-item label="关联订单">{{ currentContract?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <StatusTag :status="currentContract?.status || ''" :status-map="CONTRACT_STATUS_MAP" />
        </el-descriptions-item>
        <el-descriptions-item label="设计师">{{ currentContract?.designerName }}</el-descriptions-item>
        <el-descriptions-item label="客户姓名">{{ currentContract?.customerName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentContract?.customerPhone }}</el-descriptions-item>
        <el-descriptions-item label="总金额">{{ currentContract?.totalAmount?.toFixed(2) }} 元</el-descriptions-item>
        <el-descriptions-item label="折扣">
          {{ currentContract?.discount ? (currentContract.discount * 10).toFixed(1) + '折' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="最终金额" class="final-amount">
          {{ currentContract?.finalAmount?.toFixed(2) }} 元
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentContract?.createTime }}</el-descriptions-item>
      </el-descriptions>
      
      <h4 class="items-title">合同明细</h4>
      <el-table :data="currentContract?.items || []" border size="small">
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="unitPrice" label="单价(元)" width="140">
          <template #default="{ row }">
            {{ row.unitPrice?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalPrice" label="小计(元)" width="140">
          <template #default="{ row }">
            {{ row.totalPrice?.toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormRules } from 'element-plus'
import { Plus, Clock, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import FormDialog from '@/components/FormDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useContractStore } from '@/stores/contract'
import { useDesignerStore } from '@/stores/designer'
import { useOrderStore } from '@/stores/order'
import type { Contract, ContractStatus, ContractItem } from '@/types'
import { CONTRACT_STATUS_MAP } from '@/constants'
import axios from 'axios'

const contractStore = useContractStore()
const designerStore = useDesignerStore()
const orderStore = useOrderStore()

const searchForm = reactive({
  contractNo: '',
  customerName: '',
  status: '',
  designerId: '',
  minAmount: null as number | null,
  maxAmount: null as number | null
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const sortState = reactive({
  prop: '',
  order: ''
})

const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const currentContractId = ref('')

const formData = reactive<Partial<Contract>>({
  contractNo: '',
  orderId: '',
  orderNo: '',
  designerId: '',
  designerName: '',
  customerName: '',
  customerPhone: '',
  items: [] as ContractItem[],
  totalAmount: 0,
  discount: 1,
  finalAmount: 0,
  status: 'pending'
})

const formRules: FormRules = {
  customerName: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  customerPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  orderId: [{ required: true, message: '请选择关联订单', trigger: 'change' }],
  designerId: [{ required: true, message: '请选择设计师', trigger: 'change' }],
  discount: [
    { required: true, message: '请设置折扣', trigger: 'change' },
    { type: 'number', min: 0.1, max: 1, message: '折扣范围在0.1到1之间', trigger: 'change' }
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  items: [
    {
      type: 'array',
      required: true,
      message: '请至少添加一项合同明细',
      trigger: 'change',
      validator: (_rule: unknown, value: ContractItem[], callback: (error?: Error) => void) => {
        if (value.length === 0) {
          callback(new Error('请至少添加一项合同明细'))
        } else {
          const hasEmpty = value.some(item => !item.name || item.quantity < 1 || item.unitPrice < 0)
          if (hasEmpty) {
            callback(new Error('请完善合同明细信息'))
          } else {
            callback()
          }
        }
      }
    }
  ]
}

const filteredContracts = computed(() => {
  let list = [...contractStore.contracts]
  
  if (searchForm.contractNo) {
    list = list.filter(c => c.contractNo.includes(searchForm.contractNo))
  }
  if (searchForm.customerName) {
    list = list.filter(c => c.customerName.includes(searchForm.customerName))
  }
  if (searchForm.status) {
    list = list.filter(c => c.status === searchForm.status)
  }
  if (searchForm.designerId) {
    list = list.filter(c => c.designerId === searchForm.designerId)
  }
  if (searchForm.minAmount !== null) {
    list = list.filter(c => (c.finalAmount || 0) >= searchForm.minAmount!)
  }
  if (searchForm.maxAmount !== null) {
    list = list.filter(c => (c.finalAmount || 0) <= searchForm.maxAmount!)
  }
  
  if (sortState.prop && sortState.order) {
    list.sort((a, b) => {
      let aValue: number | string = 0
      let bValue: number | string = 0
      
      if (sortState.prop === 'totalAmount') {
        aValue = a.totalAmount || 0
        bValue = b.totalAmount || 0
      } else if (sortState.prop === 'finalAmount') {
        aValue = a.finalAmount || 0
        bValue = b.finalAmount || 0
      }
      
      if (sortState.order === 'ascending') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }
  
  return list
})

const paginatedContracts = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredContracts.value.slice(start, end)
})

const currentContract = computed(() => {
  return contractStore.getContractById(currentContractId.value)
})

const designers = computed(() => designerStore.designers)
const orders = computed(() => orderStore.orders)

const totalAmount = computed(() => {
  return contractStore.contracts
    .filter(c => c.status === 'signed')
    .reduce((sum, c) => sum + (c.finalAmount || 0), 0)
})

const getContractCountByStatus = (status: ContractStatus) => {
  return contractStore.contracts.filter(c => c.status === status).length
}

const getNextStatus = (status: ContractStatus): ContractStatus | null => {
  const statusFlow: Record<ContractStatus, ContractStatus | null> = {
    pending: 'signed',
    signed: null,
    cancelled: null
  }
  return statusFlow[status]
}

const getTableRowClassName = ({ row }: { row: Contract }) => {
  return `contract-row-${row.status}`
}

const handleSearch = () => {
  pagination.page = 1
}

const handleReset = () => {
  Object.assign(searchForm, {
    contractNo: '',
    customerName: '',
    status: '',
    designerId: '',
    minAmount: null,
    maxAmount: null
  })
  pagination.page = 1
}

const handleAmountChange = () => {
  pagination.page = 1
}

const handleSortChange = (sortInfo: { prop: string; order: string }) => {
  sortState.prop = sortInfo.prop
  sortState.order = sortInfo.order
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    contractNo: '',
    orderId: '',
    orderNo: '',
    designerId: '',
    designerName: '',
    customerName: '',
    customerPhone: '',
    items: [{ id: Date.now().toString(), name: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    totalAmount: 0,
    discount: 1,
    finalAmount: 0,
    status: 'pending'
  })
  dialogVisible.value = true
}

const handleView = (row: Contract) => {
  currentContractId.value = row.id
  viewDialogVisible.value = true
}

const handleOrderChange = (orderId: string) => {
  const order = orders.value.find(o => o.id === orderId)
  if (order) {
    formData.orderNo = order.orderNo
    if (!formData.customerName) {
      formData.customerName = order.customerName
    }
    if (!formData.customerPhone) {
      formData.customerPhone = order.customerPhone
    }
    if (!formData.designerId && order.designerId) {
      formData.designerId = order.designerId
      formData.designerName = order.designerName || ''
    }
  }
}

const handleDesignerChange = (designerId: string) => {
  const designer = designers.value.find(d => d.id === designerId)
  formData.designerName = designer?.name || ''
}

const addItem = () => {
  formData.items?.push({
    id: Date.now().toString(),
    name: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0
  })
}

const removeItem = (index: number) => {
  formData.items?.splice(index, 1)
  calculateTotal()
}

const calculateTotal = () => {
  if (!formData.items) return
  
  const total = formData.items.reduce((sum, item) => {
    item.totalPrice = item.quantity * item.unitPrice
    return sum + item.totalPrice
  }, 0)
  
  formData.totalAmount = total
  formData.finalAmount = total * (formData.discount || 1)
}

const handleStatusChange = (row: Contract) => {
  const nextStatus = getNextStatus(row.status)
  
  if (!nextStatus) {
    ElMessageBox.prompt('请选择合同状态', '状态修改', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'select',
      inputValue: row.status,
      inputOptions: [
        { label: '待确认', value: 'pending' },
        { label: '已签约', value: 'signed' },
        { label: '已作废', value: 'cancelled' }
      ]
    }).then(({ value }) => {
      contractStore.updateContractStatus(row.id, value as ContractStatus)
      ElMessage.success('状态更新成功')
    }).catch(() => {})
    return
  }
  
  ElMessageBox.confirm(
    `确定要将合同状态从"${CONTRACT_STATUS_MAP[row.status].label}"改为"${CONTRACT_STATUS_MAP[nextStatus].label}"吗？`,
    '状态修改',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    contractStore.updateContractStatus(row.id, nextStatus)
    ElMessage.success('状态更新成功')
  }).catch(() => {})
}

const handleDelete = (id: string) => {
  ElMessageBox.confirm('确定要删除该合同吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    contractStore.deleteContract(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmit = (data: Record<string, unknown>) => {
  const now = new Date().toISOString()
  const contractNo = `CON${Date.now().toString().slice(-8)}`
  
  const order = orders.value.find(o => o.id === formData.orderId)
  
  if (isEdit.value && data.id) {
    contractStore.updateContract({
      ...data,
      orderNo: order?.orderNo || '',
      updateTime: now
    } as Contract)
    ElMessage.success('更新成功')
  } else {
    contractStore.addContract({
      id: Date.now().toString(),
      contractNo,
      ...data,
      orderNo: order?.orderNo || '',
      createTime: now,
      updateTime: now
    } as Contract)
    ElMessage.success('新增成功')
  }
}

onMounted(async () => {
  try {
    contractStore.setLoading(true)
    const [contractRes, designerRes, orderRes] = await Promise.all([
      axios.get('/api/contracts'),
      axios.get('/api/designers'),
      axios.get('/api/orders')
    ])
    
    if (contractRes.data.code === 200) {
      contractStore.setContracts(contractRes.data.data)
    }
    if (designerRes.data.code === 200) {
      designerStore.setDesigners(designerRes.data.data)
    }
    if (orderRes.data.code === 200) {
      orderStore.setOrders(orderRes.data.data)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    contractStore.setLoading(false)
  }
})
</script>

<style scoped lang="scss">
.amount-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount-separator {
  color: #909399;
  font-size: 14px;
}

.contract-stats {
  display: flex;
  gap: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.stat-item {
  &.pending :deep(.el-statistic__head) {
    color: #e6a23c;
  }
  &.signed :deep(.el-statistic__head) {
    color: #67c23a;
  }
  &.cancelled :deep(.el-statistic__head) {
    color: #f56c6c;
  }
  &.total-amount :deep(.el-statistic__content) {
    color: #409eff;
    font-weight: bold;
  }
}

.contract-items {
  width: 100%;
  
  .add-item-btn {
    margin-top: 12px;
    width: 100%;
  }
}

.amount-text {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.discount-text {
  margin-left: 12px;
  color: #606266;
}

.final-amount-text {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mt-4 {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.items-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.final-amount {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.final-amount {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.contract-row-pending) {
  background-color: #fdf6ec !important;
}

:deep(.contract-row-signed) {
  background-color: #f0f9eb !important;
}

:deep(.contract-row-cancelled) {
  background-color: #fef0f0 !important;
}
</style>
