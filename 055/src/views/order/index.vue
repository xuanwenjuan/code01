<template>
  <div class="page-card">
    <div class="page-header">
      <h2 class="page-title">客户配送订单管理</h2>
      <div class="header-stats">
        <el-tag type="warning" size="large">
          待处理：{{ orderStore.pendingCount }}
        </el-tag>
        <el-tag type="primary" size="large">
          配送中：{{ orderStore.deliveringCount }}
        </el-tag>
      </div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增订单
      </el-button>
    </div>

    <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <el-table
      :data="tableData"
      :loading="orderStore.loading"
      border
      style="width: 100%"
    >
      <el-table-column prop="orderNo" label="订单编号" width="160" />
      <el-table-column prop="customerName" label="客户名称" min-width="150" />
      <el-table-column prop="customerType" label="客户类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getCustomerTypeColor(row.customerType)" size="small">
            {{ getCustomerTypeText(row.customerType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="deliveryArea" label="配送区域" width="100" />
      <el-table-column label="商品明细" min-width="180">
        <template #default="{ row }">
          <div v-for="(item, index) in row.items" :key="index" class="item-row">
            {{ item.categoryName }}: {{ item.quantity }}{{ item.unit }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="订单金额" width="120" align="center">
        <template #default="{ row }">
          <span class="amount">¥{{ row.totalAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderDate" label="下单日期" width="110" />
      <el-table-column prop="deliveryDate" label="配送日期" width="110" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="配送进度" width="150">
        <template #default="{ row }">
          <el-progress :percentage="row.progress" :stroke-width="10" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" align="center" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === CustomerOrderStatus.PENDING">
            <el-button type="primary" link size="small" @click="handleStatusChange(row, CustomerOrderStatus.PREPARING)">
              开始备货
            </el-button>
          </template>
          <template v-else-if="row.status === CustomerOrderStatus.PREPARING">
            <el-button type="primary" link size="small" @click="handleStatusChange(row, CustomerOrderStatus.DELIVERING)">
              开始配送
            </el-button>
          </template>
          <template v-else-if="row.status === CustomerOrderStatus.DELIVERING">
            <el-button type="success" link size="small" @click="handleStatusChange(row, CustomerOrderStatus.COMPLETED)">
              完成配送
            </el-button>
            <el-dropdown @command="(progress: number) => updateProgress(row, progress)" trigger="click">
              <el-button type="primary" link size="small">
                更新进度
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="70">70%</el-dropdown-item>
                  <el-dropdown-item :command="80">80%</el-dropdown-item>
                  <el-dropdown-item :command="90">90%</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <template v-if="row.status !== CustomerOrderStatus.COMPLETED && row.status !== CustomerOrderStatus.CANCELLED">
            <el-button type="danger" link size="small" @click="handleStatusChange(row, CustomerOrderStatus.CANCELLED)">
              取消
            </el-button>
          </template>
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
      width="750px"
      :loading="submitLoading"
      @submit="handleSubmit"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户名称" prop="customerName">
            <el-input v-model="formData.customerName" placeholder="请输入客户名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户类型" prop="customerType">
            <el-select v-model="formData.customerType" placeholder="请选择" style="width: 100%">
              <el-option label="超市" :value="CustomerType.SUPERMARKET" />
              <el-option label="门店" :value="CustomerType.STORE" />
              <el-option label="团购" :value="CustomerType.GROUPBUY" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="配送区域" prop="deliveryArea">
            <el-select v-model="formData.deliveryArea" placeholder="请选择" style="width: 100%">
              <el-option label="东城区" value="东城区" />
              <el-option label="西城区" value="西城区" />
              <el-option label="朝阳区" value="朝阳区" />
              <el-option label="海淀区" value="海淀区" />
              <el-option label="丰台区" value="丰台区" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="配送日期" prop="deliveryDate">
            <el-date-picker
              v-model="formData.deliveryDate"
              type="date"
              placeholder="请选择"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人" prop="contactPerson">
            <el-input v-model="formData.contactPerson" placeholder="请输入联系人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="配送地址" prop="deliveryAddress">
        <el-input v-model="formData.deliveryAddress" placeholder="请输入配送地址" />
      </el-form-item>

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
          <el-table-column prop="quantity" label="数量" width="90">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="1" size="small" style="width: 100%" @change="calculateTotal" />
            </template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" width="70">
            <template #default="{ row }">
              <el-select v-model="row.unit" size="small" placeholder="请选择">
                <el-option label="kg" value="kg" />
                <el-option label="斤" value="斤" />
                <el-option label="箱" value="箱" />
                <el-option label="件" value="件" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="unitPrice" label="单价" width="90">
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
          <el-form-item label="配送进度" prop="progress">
            <el-slider v-model="formData.progress" :min="0" :max="100" show-input />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import FormDialog from '@/components/FormDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import type { CustomerOrder, OrderItem, SearchField } from '@/types'
import { CustomerOrderStatus, CustomerType } from '@/types'
import dayjs from 'dayjs'

const orderStore = useOrderStore()

const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const dialogTitle = computed(() => isEdit.value ? '编辑订单' : '新增订单')

const formData = reactive<Partial<CustomerOrder>>({
  customerName: '',
  customerType: CustomerType.SUPERMARKET,
  deliveryArea: '',
  deliveryAddress: '',
  contactPerson: '',
  phone: '',
  items: [],
  totalAmount: 0,
  orderDate: dayjs().format('YYYY-MM-DD'),
  deliveryDate: '',
  status: CustomerOrderStatus.PENDING,
  progress: 0,
  remark: ''
})

const formRules = {
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  customerType: [{ required: true, message: '请选择客户类型', trigger: 'change' }],
  deliveryArea: [{ required: true, message: '请选择配送区域', trigger: 'change' }],
  deliveryAddress: [{ required: true, message: '请输入配送地址', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  deliveryDate: [{ required: true, message: '请选择配送日期', trigger: 'change' }]
}

const searchFields: SearchField[] = [
  { label: '订单编号', prop: 'orderNo', type: 'input' },
  { label: '客户类型', prop: 'customerType', type: 'select', options: [
    { label: '超市', value: CustomerType.SUPERMARKET },
    { label: '门店', value: CustomerType.STORE },
    { label: '团购', value: CustomerType.GROUPBUY }
  ]},
  { label: '配送区域', prop: 'deliveryArea', type: 'select', options: [
    { label: '东城区', value: '东城区' },
    { label: '西城区', value: '西城区' },
    { label: '朝阳区', value: '朝阳区' },
    { label: '海淀区', value: '海淀区' },
    { label: '丰台区', value: '丰台区' }
  ]},
  { label: '订单状态', prop: 'status', type: 'select', options: [
    { label: '待处理', value: CustomerOrderStatus.PENDING },
    { label: '备货中', value: CustomerOrderStatus.PREPARING },
    { label: '配送中', value: CustomerOrderStatus.DELIVERING },
    { label: '已完成', value: CustomerOrderStatus.COMPLETED },
    { label: '已取消', value: CustomerOrderStatus.CANCELLED }
  ]}
]

const searchParams = reactive<Record<string, unknown>>({})

const tableData = computed(() => {
  let data = [...orderStore.customerOrders]
  
  if (searchParams.orderNo) {
    const keyword = (searchParams.orderNo as string).toLowerCase()
    data = data.filter(item => item.orderNo.toLowerCase().includes(keyword))
  }
  
  if (searchParams.customerType) {
    data = data.filter(item => item.customerType === searchParams.customerType)
  }
  
  if (searchParams.deliveryArea) {
    data = data.filter(item => item.deliveryArea === searchParams.deliveryArea)
  }
  
  if (searchParams.status) {
    data = data.filter(item => item.status === searchParams.status)
  }
  
  return data
})

const getStatusType = (status: CustomerOrderStatus) => {
  const map: Record<CustomerOrderStatus, string> = {
    [CustomerOrderStatus.PENDING]: 'warning',
    [CustomerOrderStatus.PREPARING]: 'primary',
    [CustomerOrderStatus.DELIVERING]: 'primary',
    [CustomerOrderStatus.COMPLETED]: 'success',
    [CustomerOrderStatus.CANCELLED]: 'danger'
  }
  return map[status] || ''
}

const getStatusText = (status: CustomerOrderStatus) => {
  const map: Record<CustomerOrderStatus, string> = {
    [CustomerOrderStatus.PENDING]: '待处理',
    [CustomerOrderStatus.PREPARING]: '备货中',
    [CustomerOrderStatus.DELIVERING]: '配送中',
    [CustomerOrderStatus.COMPLETED]: '已完成',
    [CustomerOrderStatus.CANCELLED]: '已取消'
  }
  return map[status] || status
}

const getCustomerTypeText = (type: CustomerType) => {
  const map: Record<CustomerType, string> = {
    [CustomerType.SUPERMARKET]: '超市',
    [CustomerType.STORE]: '门店',
    [CustomerType.GROUPBUY]: '团购'
  }
  return map[type] || type
}

const getCustomerTypeColor = (type: CustomerType) => {
  const map: Record<CustomerType, string> = {
    [CustomerType.SUPERMARKET]: 'success',
    [CustomerType.STORE]: 'primary',
    [CustomerType.GROUPBUY]: 'warning'
  }
  return map[type] || ''
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
  } as OrderItem)
}

const removeItem = (index: number) => {
  formData.items?.splice(index, 1)
  calculateTotal()
}

const resetForm = () => {
  Object.assign(formData, {
    customerName: '',
    customerType: CustomerType.SUPERMARKET,
    deliveryArea: '',
    deliveryAddress: '',
    contactPerson: '',
    phone: '',
    items: [],
    totalAmount: 0,
    orderDate: dayjs().format('YYYY-MM-DD'),
    deliveryDate: '',
    status: CustomerOrderStatus.PENDING,
    progress: 0,
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

const handleEdit = (row: CustomerOrder) => {
  isEdit.value = true
  Object.assign(formData, { ...row, items: [...row.items] })
  dialogVisible.value = true
}

const handleStatusChange = async (row: CustomerOrder, status: CustomerOrderStatus) => {
  try {
    await ElMessageBox.confirm(
      `确定要将订单状态变更为"${getStatusText(status)}"吗？`,
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await orderStore.updateStatus(row.id, status)
  } catch {
  }
}

const updateProgress = async (row: CustomerOrder, progress: number) => {
  await orderStore.updateProgress(row.id, progress)
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
      const success = await orderStore.updateCustomerOrder(formData as CustomerOrder)
      if (success) dialogVisible.value = false
    } else {
      const success = await orderStore.addCustomerOrder(formData as Omit<CustomerOrder, 'id' | 'orderNo'>)
      if (success) dialogVisible.value = false
    }
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  orderStore.fetchCustomerOrders()
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
</style>
