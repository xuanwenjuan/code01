<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">设计需求订单管理</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增订单
      </el-button>
    </div>

    <el-card>
      <SearchForm 
        :initial-values="{ orderNo: '', customerName: '', status: '', designerId: '', style: '' }"
        @search="handleSearch"
        @reset="handleReset"
      >
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable />
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户姓名" clearable />
        </el-form-item>
        <el-form-item label="设计风格">
          <el-select v-model="searchForm.style" placeholder="请选择风格" clearable>
            <el-option 
              v-for="style in STYLE_OPTIONS" 
              :key="style.value" 
              :label="style.label" 
              :value="style.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设计师">
          <el-select v-model="searchForm.designerId" placeholder="请选择设计师" clearable>
            <el-option 
              v-for="designer in availableDesigners" 
              :key="designer.id" 
              :label="designer.name" 
              :value="designer.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待派单" value="pending" />
            <el-option label="已派单" value="assigned" />
            <el-option label="设计中" value="designing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已成交" value="deal" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <div class="order-steps-wrapper">
        <el-steps :active="activeStepIndex" finish-status="success" align-center>
          <el-step title="待派单" :status="getStepStatus('pending')">
            <template #icon>
              <div class="step-icon-wrapper">
                <el-icon class="step-icon"><Document /></el-icon>
                <span class="step-count">{{ getOrderCountByStatus('pending') }}</span>
              </div>
            </template>
          </el-step>
          <el-step title="已派单" :status="getStepStatus('assigned')">
            <template #icon>
              <div class="step-icon-wrapper">
                <el-icon class="step-icon"><User /></el-icon>
                <span class="step-count">{{ getOrderCountByStatus('assigned') }}</span>
              </div>
            </template>
          </el-step>
          <el-step title="设计中" :status="getStepStatus('designing')">
            <template #icon>
              <div class="step-icon-wrapper">
                <el-icon class="step-icon"><Edit /></el-icon>
                <span class="step-count">{{ getOrderCountByStatus('designing') }}</span>
              </div>
            </template>
          </el-step>
          <el-step title="已完成" :status="getStepStatus('completed')">
            <template #icon>
              <div class="step-icon-wrapper">
                <el-icon class="step-icon"><Check /></el-icon>
                <span class="step-count">{{ getOrderCountByStatus('completed') }}</span>
              </div>
            </template>
          </el-step>
          <el-step title="已成交" :status="getStepStatus('deal')">
            <template #icon>
              <div class="step-icon-wrapper">
                <el-icon class="step-icon"><Tickets /></el-icon>
                <span class="step-count">{{ getOrderCountByStatus('deal') }}</span>
              </div>
            </template>
          </el-step>
        </el-steps>
      </div>

      <el-table 
        :data="paginatedOrders" 
        border 
        stripe 
        class="mt-4"
        v-loading="orderStore.loading"
        :row-class-name="getTableRowClassName"
      >
        <el-table-column prop="orderNo" label="订单编号" width="140" />
        <el-table-column prop="customerName" label="客户姓名" width="120" />
        <el-table-column prop="customerPhone" label="联系电话" width="140" />
        <el-table-column prop="style" label="风格要求" width="120" />
        <el-table-column prop="houseType" label="户型" width="120" />
        <el-table-column prop="area" label="面积(㎡)" width="100" />
        <el-table-column prop="designerName" label="设计师" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="ORDER_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              link 
              type="success" 
              size="small" 
              @click="handleAssign(row)"
            >
              派单
            </el-button>
            <el-button 
              v-if="canTransferStatus(row.status)" 
              link 
              type="warning" 
              size="small" 
              @click="handleTransferStatus(row)"
            >
              流转
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="filteredOrders.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <FormDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑订单' : '新增订单'"
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
      <el-form-item label="风格要求" prop="style">
        <el-select v-model="formData.style" placeholder="请选择风格" style="width: 100%">
          <el-option 
            v-for="styleItem in STYLE_OPTIONS" 
            :key="styleItem.value" 
            :label="styleItem.label" 
            :value="styleItem.value" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="户型" prop="houseType">
        <el-select v-model="formData.houseType" placeholder="请选择户型" style="width: 100%">
          <el-option 
            v-for="house in HOUSE_TYPE_OPTIONS" 
            :key="house.value" 
            :label="house.label" 
            :value="house.value" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="面积(㎡)" prop="area">
        <el-input-number v-model="formData.area" :min="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="需求描述" prop="requirement">
        <el-input 
          v-model="formData.requirement" 
          type="textarea" 
          :rows="4" 
          placeholder="请输入需求描述" 
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="pending">待派单</el-radio>
          <el-radio label="assigned">已派单</el-radio>
          <el-radio label="designing">设计中</el-radio>
          <el-radio label="completed">已完成</el-radio>
          <el-radio label="deal">已成交</el-radio>
        </el-radio-group>
      </el-form-item>
    </FormDialog>

    <el-dialog v-model="assignDialogVisible" title="派单给设计师" width="500px">
      <el-form :model="assignForm" :rules="assignRules" ref="assignFormRef">
        <el-form-item label="选择设计师" prop="designerId">
          <el-select v-model="assignForm.designerId" placeholder="请选择设计师" style="width: 100%">
            <el-option
              v-for="designer in getMatchedDesigners(currentOrder?.style)"
              :key="designer.id"
              :label="`${designer.name} (${designer.specialtyStyles.join('、')})`"
              :value="designer.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确定派单</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ currentOrder?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <StatusTag :status="currentOrder?.status || ''" :status-map="ORDER_STATUS_MAP" />
        </el-descriptions-item>
        <el-descriptions-item label="客户姓名">{{ currentOrder?.customerName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder?.customerPhone }}</el-descriptions-item>
        <el-descriptions-item label="风格要求">{{ currentOrder?.style }}</el-descriptions-item>
        <el-descriptions-item label="户型">{{ currentOrder?.houseType }}</el-descriptions-item>
        <el-descriptions-item label="面积">{{ currentOrder?.area }}㎡</el-descriptions-item>
        <el-descriptions-item label="设计师">{{ currentOrder?.designerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="需求描述" :span="2">{{ currentOrder?.requirement }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentOrder?.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Document, User, Edit, Check, Tickets } from '@element-plus/icons-vue'
import FormDialog from '@/components/FormDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useOrderStore } from '@/stores/order'
import { useDesignerStore } from '@/stores/designer'
import type { Order, OrderStatus } from '@/types'
import { ORDER_STATUS_MAP, STYLE_OPTIONS, HOUSE_TYPE_OPTIONS } from '@/constants'
import axios from 'axios'

const orderStore = useOrderStore()
const designerStore = useDesignerStore()

const searchForm = reactive({
  orderNo: '',
  customerName: '',
  status: '',
  designerId: '',
  style: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const dialogVisible = ref(false)
const assignDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const currentOrderId = ref('')

const formData = reactive<Partial<Order>>({
  orderNo: '',
  customerName: '',
  customerPhone: '',
  style: '',
  houseType: '',
  area: 0,
  status: 'pending',
  requirement: ''
})

const assignForm = reactive({
  designerId: ''
})

const assignFormRef = ref<FormInstance>()

const assignRules: FormRules = {
  designerId: [{ required: true, message: '请选择设计师', trigger: 'change' }]
}

const formRules: FormRules = {
  customerName: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  customerPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  style: [{ required: true, message: '请选择风格', trigger: 'change' }],
  houseType: [{ required: true, message: '请选择户型', trigger: 'change' }],
  area: [
    { required: true, message: '请输入面积', trigger: 'blur' },
    { type: 'number', min: 1, message: '面积必须大于0', trigger: 'blur' }
  ],
  requirement: [
    { required: true, message: '请输入需求描述', trigger: 'blur' },
    { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const filteredOrders = computed(() => {
  let list = [...orderStore.orders]
  
  if (searchForm.orderNo) {
    list = list.filter(o => o.orderNo.includes(searchForm.orderNo))
  }
  if (searchForm.customerName) {
    list = list.filter(o => o.customerName.includes(searchForm.customerName))
  }
  if (searchForm.status) {
    list = list.filter(o => o.status === searchForm.status)
  }
  if (searchForm.designerId) {
    list = list.filter(o => o.designerId === searchForm.designerId)
  }
  if (searchForm.style) {
    list = list.filter(o => o.style === searchForm.style)
  }
  
  return list
})

const paginatedOrders = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredOrders.value.slice(start, end)
})

const currentOrder = computed(() => {
  return orderStore.getOrderById(currentOrderId.value)
})

const availableDesigners = computed(() => {
  return designerStore.designers.filter(d => d.status === 'on')
})

const activeStepIndex = computed(() => {
  if (searchForm.status) {
    const statusList: OrderStatus[] = ['pending', 'assigned', 'designing', 'completed', 'deal']
    return statusList.indexOf(searchForm.status as OrderStatus)
  }
  return -1
})

const getMatchedDesigners = (style?: string) => {
  if (!style) return availableDesigners.value
  return availableDesigners.value.filter(d => d.specialtyStyles.includes(style))
}

const getOrderCountByStatus = (status: OrderStatus) => {
  return orderStore.orders.filter(o => o.status === status).length
}

const getStepStatus = (status: OrderStatus) => {
  if (searchForm.status === status) return 'process'
  if (searchForm.status) {
    const statusList: OrderStatus[] = ['pending', 'assigned', 'designing', 'completed', 'deal']
    const selectedIndex = statusList.indexOf(searchForm.status as OrderStatus)
    const currentIndex = statusList.indexOf(status)
    if (currentIndex < selectedIndex) return 'finish'
  }
  return 'wait'
}

const canTransferStatus = (status: OrderStatus) => {
  return status !== 'deal'
}

const getNextStatus = (status: OrderStatus): OrderStatus | null => {
  const statusFlow: Record<OrderStatus, OrderStatus | null> = {
    pending: 'assigned',
    assigned: 'designing',
    designing: 'completed',
    completed: 'deal',
    deal: null
  }
  return statusFlow[status]
}

const getTableRowClassName = ({ row }: { row: Order }) => {
  return `order-row-${row.status}`
}

const handleSearch = () => {
  pagination.page = 1
}

const handleReset = () => {
  Object.assign(searchForm, {
    orderNo: '',
    customerName: '',
    status: '',
    designerId: '',
    style: ''
  })
  pagination.page = 1
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
    customerName: '',
    customerPhone: '',
    style: '',
    houseType: '',
    area: 0,
    status: 'pending',
    requirement: ''
  })
  dialogVisible.value = true
}

const handleView = (row: Order) => {
  currentOrderId.value = row.id
  viewDialogVisible.value = true
}

const handleAssign = (row: Order) => {
  currentOrderId.value = row.id
  assignForm.designerId = ''
  assignDialogVisible.value = true
}

const confirmAssign = async () => {
  if (!assignFormRef.value) return
  
  await assignFormRef.value.validate((valid) => {
    if (valid) {
      const designer = designerStore.designers.find(d => d.id === assignForm.designerId)
      orderStore.assignDesigner(currentOrderId.value, assignForm.designerId, designer?.name || '')
      assignDialogVisible.value = false
      ElMessage.success('派单成功')
      nextTick(() => {
        if (searchForm.status !== 'pending') {
          searchForm.status = 'assigned'
        }
      })
    }
  })
}

const handleTransferStatus = (row: Order) => {
  const nextStatus = getNextStatus(row.status)
  if (!nextStatus) {
    ElMessage.info('已是最终状态')
    return
  }
  
  ElMessageBox.confirm(
    `确定要将订单状态从"${ORDER_STATUS_MAP[row.status].label}"改为"${ORDER_STATUS_MAP[nextStatus].label}"吗？`,
    '状态流转',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    orderStore.updateOrderStatus(row.id, nextStatus)
    ElMessage.success('状态流转成功')
    nextTick(() => {
      if (searchForm.status && searchForm.status !== nextStatus) {
        searchForm.status = ''
      }
    })
  }).catch(() => {})
}

const handleDelete = (id: string) => {
  ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    orderStore.deleteOrder(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmit = (data: Record<string, unknown>) => {
  const now = new Date().toISOString()
  const orderNo = `ORD${Date.now().toString().slice(-8)}`
  
  if (isEdit.value && data.id) {
    orderStore.updateOrder({
      ...data,
      updateTime: now
    } as Order)
    ElMessage.success('更新成功')
  } else {
    orderStore.addOrder({
      id: Date.now().toString(),
      orderNo,
      ...data,
      createTime: now,
      updateTime: now
    } as Order)
    ElMessage.success('新增成功')
  }
}

onMounted(async () => {
  try {
    orderStore.setLoading(true)
    const [orderRes, designerRes] = await Promise.all([
      axios.get('/api/orders'),
      axios.get('/api/designers')
    ])
    
    if (orderRes.data.code === 200) {
      orderStore.setOrders(orderRes.data.data)
    }
    if (designerRes.data.code === 200) {
      designerStore.setDesigners(designerRes.data.data)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    orderStore.setLoading(false)
  }
})
</script>

<style scoped lang="scss">
.order-steps-wrapper {
  padding: 20px 0;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.step-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.step-icon {
  font-size: 20px;
}

.step-count {
  font-size: 12px;
  margin-top: 2px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mt-4 {
  margin-top: 16px;
}

:deep(.order-row-pending) {
  background-color: #fdf6ec !important;
}

:deep(.order-row-assigned) {
  background-color: #ecf5ff !important;
}

:deep(.order-row-designing) {
  background-color: #f4f4f5 !important;
}

:deep(.order-row-completed) {
  background-color: #f0f9eb !important;
}

:deep(.order-row-deal) {
  background-color: #e6f7ff !important;
}
</style>
