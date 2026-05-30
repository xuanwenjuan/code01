<template>
  <div class="page-card">
    <div class="page-header">
      <h2 class="page-title">采购订货单管理</h2>
      <div class="header-stats">
        <el-tag type="warning" size="large">
          待确认：{{ purchaseStore.pendingCount }}
        </el-tag>
        <el-tag type="primary" size="large">
          配送中：{{ purchaseStore.deliveringCount }}
        </el-tag>
      </div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增订货单
      </el-button>
    </div>

    <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <el-table
      :data="tableData"
      :loading="purchaseStore.loading"
      border
      style="width: 100%"
    >
      <el-table-column prop="orderNo" label="订单编号" width="160" />
      <el-table-column prop="supplierName" label="供应商" min-width="150" />
      <el-table-column label="商品明细" min-width="200">
        <template #default="{ row }">
          <div v-for="(item, index) in row.items" :key="index" class="item-row">
            {{ item.categoryName }}: {{ item.quantity }}{{ item.unit }} × ¥{{ item.unitPrice }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="总金额" width="120" align="center">
        <template #default="{ row }">
          <span class="amount">¥{{ row.totalAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderDate" label="下单日期" width="120" />
      <el-table-column prop="expectedDate" label="预计到货" width="120" />
      <el-table-column prop="actualDate" label="实际到货" width="120" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="defectiveQuantity" label="次品数" width="90" align="center">
        <template #default="{ row }">
          <span v-if="row.defectiveQuantity !== undefined" class="defective">
            {{ row.defectiveQuantity }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === PurchaseOrderStatus.PENDING">
            <el-button type="success" link size="small" @click="handleStatusChange(row, PurchaseOrderStatus.DELIVERING)">
              确认配送
            </el-button>
            <el-button type="danger" link size="small" @click="handleStatusChange(row, PurchaseOrderStatus.REJECTED)">
              驳回
            </el-button>
          </template>
          <template v-else-if="row.status === PurchaseOrderStatus.DELIVERING">
            <el-button type="success" link size="small" @click="handleReceive(row)">
              确认入库
            </el-button>
          </template>
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="tableData.length"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; justify-content: flex-end"
    />

    <FormDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      width="700px"
      :loading="submitLoading"
      @submit="handleSubmit"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="供应商" prop="supplierName">
            <el-select v-model="formData.supplierName" placeholder="请选择" style="width: 100%">
              <el-option label="山东寿光合作社" value="山东寿光合作社" />
              <el-option label="云南昆明农场" value="云南昆明农场" />
              <el-option label="广东广州基地" value="广东广州基地" />
              <el-option label="浙江杭州农场" value="浙江杭州农场" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预计到货" prop="expectedDate">
            <el-date-picker
              v-model="formData.expectedDate"
              type="date"
              placeholder="请选择"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="商品明细">
        <el-table :data="formData.items" border size="small" style="width: 100%">
          <el-table-column prop="categoryName" label="商品名称" width="120">
            <template #default="{ row }">
              <el-select v-model="row.categoryName" size="small" placeholder="请选择">
                <el-option label="白菜" value="白菜" />
                <el-option label="萝卜" value="萝卜" />
                <el-option label="苹果" value="苹果" />
                <el-option label="橙子" value="橙子" />
                <el-option label="猪肉" value="猪肉" />
                <el-option label="鸡肉" value="鸡肉" />
                <el-option label="鲫鱼" value="鲫鱼" />
                <el-option label="虾" value="虾" />
                <el-option label="香菇" value="香菇" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="1" size="small" style="width: 100%" @change="calculateTotal" />
            </template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" width="80">
            <template #default="{ row }">
              <el-select v-model="row.unit" size="small" placeholder="请选择">
                <el-option label="kg" value="kg" />
                <el-option label="斤" value="斤" />
                <el-option label="箱" value="箱" />
                <el-option label="件" value="件" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="unitPrice" label="单价" width="100">
            <template #default="{ row }">
              <el-input-number v-model="row.unitPrice" :min="0" :precision="2" size="small" style="width: 100%" @change="calculateTotal" />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="100" align="center">
            <template #default="{ row }">
              ¥{{ (row.quantity * row.unitPrice).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" @click="removeItem($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" size="small" @click="addItem" style="margin-top: 10px">
          <el-icon><Plus /></el-icon> 添加商品
        </el-button>
      </el-form-item>

      <el-row :gutter="20" v-if="isEdit">
        <el-col :span="12">
          <el-form-item label="次品数量" prop="defectiveQuantity">
            <el-input-number v-model="formData.defectiveQuantity" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </FormDialog>

    <el-dialog
      v-model="receiveDialogVisible"
      title="确认入库"
      width="400px"
    >
      <el-form :model="receiveForm" label-width="100px">
        <el-form-item label="次品数量">
          <el-input-number v-model="receiveForm.defectiveQuantity" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="receiveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReceive" :loading="submitLoading">确认入库</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { usePurchaseStore } from '@/stores/purchase'
import FormDialog from '@/components/FormDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import type { PurchaseOrder, PurchaseOrderItem, SearchField } from '@/types'
import { PurchaseOrderStatus } from '@/types'
import dayjs from 'dayjs'

const purchaseStore = usePurchaseStore()

const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

const dialogVisible = ref(false)
const receiveDialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const currentOrderId = ref<number | null>(null)
const dialogTitle = computed(() => isEdit.value ? '编辑订货单' : '新增订货单')

const receiveForm = reactive({
  defectiveQuantity: 0
})

const formData = reactive<Partial<PurchaseOrder>>({
  supplierName: '',
  items: [],
  totalAmount: 0,
  orderDate: dayjs().format('YYYY-MM-DD'),
  expectedDate: '',
  status: PurchaseOrderStatus.PENDING,
  defectiveQuantity: 0,
  remark: ''
})

const formRules = {
  supplierName: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  expectedDate: [{ required: true, message: '请选择预计到货日期', trigger: 'change' }]
}

const searchFields: SearchField[] = [
  { label: '订单编号', prop: 'orderNo', type: 'input' },
  { label: '订单状态', prop: 'status', type: 'select', options: [
    { label: '待确认', value: PurchaseOrderStatus.PENDING },
    { label: '配送中', value: PurchaseOrderStatus.DELIVERING },
    { label: '已入库', value: PurchaseOrderStatus.RECEIVED },
    { label: '已驳回', value: PurchaseOrderStatus.REJECTED }
  ]}
]

const searchParams = reactive<Record<string, unknown>>({})

const tableData = computed(() => {
  let data = [...purchaseStore.purchaseOrders]
  
  if (searchParams.orderNo) {
    const keyword = (searchParams.orderNo as string).toLowerCase()
    data = data.filter(item => item.orderNo.toLowerCase().includes(keyword))
  }
  
  if (searchParams.status) {
    data = data.filter(item => item.status === searchParams.status)
  }
  
  return data
})

const getStatusType = (status: PurchaseOrderStatus) => {
  const map: Record<PurchaseOrderStatus, string> = {
    [PurchaseOrderStatus.PENDING]: 'warning',
    [PurchaseOrderStatus.DELIVERING]: 'primary',
    [PurchaseOrderStatus.RECEIVED]: 'success',
    [PurchaseOrderStatus.REJECTED]: 'danger'
  }
  return map[status] || ''
}

const getStatusText = (status: PurchaseOrderStatus) => {
  const map: Record<PurchaseOrderStatus, string> = {
    [PurchaseOrderStatus.PENDING]: '待确认',
    [PurchaseOrderStatus.DELIVERING]: '配送中',
    [PurchaseOrderStatus.RECEIVED]: '已入库',
    [PurchaseOrderStatus.REJECTED]: '已驳回'
  }
  return map[status] || status
}

const calculateTotal = () => {
  if (formData.items) {
    formData.totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }
}

const addItem = () => {
  if (!formData.items) formData.items = []
  formData.items.push({
    categoryId: Date.now(),
    categoryName: '',
    quantity: 1,
    unit: 'kg',
    unitPrice: 0,
    subtotal: 0
  } as PurchaseOrderItem)
}

const removeItem = (index: number) => {
  formData.items?.splice(index, 1)
  calculateTotal()
}

const resetForm = () => {
  Object.assign(formData, {
    supplierName: '',
    items: [],
    totalAmount: 0,
    orderDate: dayjs().format('YYYY-MM-DD'),
    expectedDate: '',
    status: PurchaseOrderStatus.PENDING,
    defectiveQuantity: 0,
    remark: ''
  })
}

const handleSearch = (values: Record<string, unknown>) => {
  Object.assign(searchParams, values)
  pagination.value.currentPage = 1
}

const handleReset = () => {
  Object.keys(searchParams).forEach(key => {
    searchParams[key] = ''
  })
  pagination.value.currentPage = 1
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  addItem()
  dialogVisible.value = true
}

const handleEdit = (row: PurchaseOrder) => {
  isEdit.value = true
  Object.assign(formData, { ...row, items: [...row.items] })
  dialogVisible.value = true
}

const handleStatusChange = async (row: PurchaseOrder, status: PurchaseOrderStatus) => {
  try {
    await ElMessageBox.confirm(
      `确定要将订单状态变更为"${getStatusText(status)}"吗？`,
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await purchaseStore.updateStatus(row.id, status)
  } catch {
  }
}

const handleReceive = (row: PurchaseOrder) => {
  currentOrderId.value = row.id
  receiveForm.defectiveQuantity = 0
  receiveDialogVisible.value = true
}

const confirmReceive = async () => {
  if (currentOrderId.value === null) return
  
  submitLoading.value = true
  try {
    await purchaseStore.updateStatus(
      currentOrderId.value,
      PurchaseOrderStatus.RECEIVED,
      receiveForm.defectiveQuantity
    )
    receiveDialogVisible.value = false
  } finally {
    submitLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!formData.items || formData.items.length === 0) {
    ElMessage.error('请添加至少一个商品')
    return
  }
  
  submitLoading.value = true
  try {
    calculateTotal()
    if (isEdit.value) {
      const success = await purchaseStore.updatePurchaseOrder(formData as PurchaseOrder)
      if (success) dialogVisible.value = false
    } else {
      const success = await purchaseStore.addPurchaseOrder(formData as Omit<PurchaseOrder, 'id' | 'orderNo'>)
      if (success) dialogVisible.value = false
    }
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  purchaseStore.fetchPurchaseOrders()
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }

  .header-stats {
    display: flex;
    gap: 10px;
    flex: 1;
    margin: 0 20px;
  }
}

.item-row {
  font-size: 12px;
  line-height: 1.6;
  color: #606266;
}

.amount {
  font-weight: 600;
  color: #f56c6c;
}

.defective {
  color: #e6a23c;
  font-weight: 500;
}
</style>
