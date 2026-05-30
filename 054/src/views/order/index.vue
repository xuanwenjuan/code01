<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormRules } from 'element-plus'
import request from '@/utils/request'
import type { Order, OrderItem, PageResult, ShipInfo } from '@/types'
import { ORDER_STATUS_MAP, LOGISTICS_COMPANIES } from '@/types'
import CrudDialog from '@/components/CrudDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import { Plus, CircleCheck, Truck, DocumentChecked, Close, View, Check } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref<Order[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('发货')
const detailVisible = ref(false)
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const searchParams = reactive({
  orderNo: '',
  customerName: '',
  status: '',
  startDate: '',
  endDate: ''
})

const shipForm = reactive<ShipInfo & { orderId: string }>({
  orderId: '',
  logisticsCompany: '',
  trackingNumber: ''
})

const currentOrder = ref<Order | null>(null)

const shipFormRules: FormRules = {
  logisticsCompany: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
  trackingNumber: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
}

const orderStatusFlow: Record<string, string[]> = {
  pending: ['approved', 'cancelled'],
  approved: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: []
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchParams,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const res: PageResult<Order> = await request.get('/order', { params })
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(searchParams, {
    orderNo: '',
    customerName: '',
    status: '',
    startDate: '',
    endDate: ''
  })
  pagination.page = 1
  nextTick(() => fetchData())
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchData()
}

const handleViewDetail = (row: Order) => {
  currentOrder.value = row
  detailVisible.value = true
}

const canTransitionTo = (currentStatus: string, targetStatus: string) => {
  return orderStatusFlow[currentStatus]?.includes(targetStatus) ?? false
}

const handleApprove = async (row: Order) => {
  try {
    await ElMessageBox.confirm('确定审核通过该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.put(`/order/${row.id}/approve`)
    ElMessage.success('审核通过')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleShip = (row: Order) => {
  dialogTitle.value = '订单发货'
  shipForm.orderId = row.id
  shipForm.logisticsCompany = ''
  shipForm.trackingNumber = ''
  dialogVisible.value = true
}

const handleDelivered = async (row: Order) => {
  try {
    await ElMessageBox.confirm('确认订单已送达吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.put(`/order/${row.id}/deliver`)
    ElMessage.success('订单已送达')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleComplete = async (row: Order) => {
  try {
    await ElMessageBox.confirm('确定完成该订单吗？完成后不可撤销。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.put(`/order/${row.id}/complete`)
    ElMessage.success('订单已完成')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleCancel = async (row: Order) => {
  try {
    await ElMessageBox.confirm('确定取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.put(`/order/${row.id}/cancel`)
    ElMessage.success('订单已取消')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleShipSubmit = async (form: Record<string, any>) => {
  try {
    await request.put(`/order/${form.orderId}/ship`, {
      logisticsCompany: form.logisticsCompany,
      trackingNumber: form.trackingNumber
    })
    ElMessage.success('发货成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const getStatusProgress = (status: string) => {
  const statuses = ['pending', 'approved', 'shipped', 'delivered', 'completed']
  const currentIndex = statuses.indexOf(status)
  return {
    currentIndex,
    steps: [
      { key: 'pending', label: '待审核', icon: DocumentChecked },
      { key: 'approved', label: '已审核', icon: CircleCheck },
      { key: 'shipped', label: '已发货', icon: Truck },
      { key: 'delivered', label: '已送达', icon: View },
      { key: 'completed', label: '已完成', icon: CircleCheck }
    ],
    isCompleted: status === 'completed',
    isCancelled: status === 'cancelled'
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="order-page">
    <el-card>
      <template #header>
        <div class="page-header">
          <span class="page-title">销售订单管理</span>
        </div>
      </template>

      <SearchForm
        :model-value="searchParams"
        @search="handleSearch"
        @reset="handleReset"
      >
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="searchParams.orderNo" placeholder="请输入订单号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="客户" prop="customerName">
          <el-input v-model="searchParams.customerName" placeholder="请输入客户姓名" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchParams.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="待审核" value="pending" />
            <el-option label="已审核" value="approved" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已送达" value="delivered" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间" prop="startDate">
          <el-date-picker
            v-model="searchParams.startDate"
            type="date"
            placeholder="开始日期"
            style="width: 120px"
            value-format="YYYY-MM-DD"
          />
          <span style="margin: 0 8px">-</span>
          <el-date-picker
            v-model="searchParams.endDate"
            type="date"
            placeholder="结束日期"
            style="width: 120px"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </SearchForm>

      <div class="table-wrapper virtual-scroll-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          border
          stripe
          :row-key="(row: Order) => row.id"
        >
          <el-table-column prop="orderNo" label="订单号" width="160" show-overflow-tooltip />
          <el-table-column prop="customerName" label="客户姓名" width="100" />
          <el-table-column prop="customerPhone" label="联系电话" width="130" />
          <el-table-column label="订单金额" width="120" align="right">
            <template #default="{ row }">
              <span style="color: #f56c6c; font-weight: 600">¥{{ row.totalAmount.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="logisticsCompany" label="物流公司" width="120" show-overflow-tooltip />
          <el-table-column prop="trackingNumber" label="物流单号" width="150" show-overflow-tooltip />
          <el-table-column prop="status" label="订单状态" width="180" align="center">
            <template #default="{ row }">
              <el-tag :type="ORDER_STATUS_MAP[row.status].type">
                {{ ORDER_STATUS_MAP[row.status].label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态进度" min-width="350" align="center">
            <template #default="{ row }">
              <div class="status-progress" v-if="!getStatusProgress(row.status).isCancelled">
                <template v-for="(step, index) in getStatusProgress(row.status).steps" :key="step.key">
                  <div class="progress-step">
                    <div
                      class="step-dot"
                      :class="{
                        active: index < getStatusProgress(row.status).currentIndex,
                        current: index === getStatusProgress(row.status).currentIndex
                      }"
                    >
                      <el-icon :size="12" v-if="index < getStatusProgress(row.status).currentIndex">
                        <Check />
                      </el-icon>
                    </div>
                    <span
                      class="step-label"
                      :class="{ active: index <= getStatusProgress(row.status).currentIndex }"
                    >
                      {{ step.label }}
                    </span>
                  </div>
                  <div
                    v-if="index < getStatusProgress(row.status).steps.length - 1"
                    class="step-line"
                    :class="{ active: index < getStatusProgress(row.status).currentIndex }"
                  />
                </template>
              </div>
              <el-tag type="info" v-else>已取消</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="260" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button link type="primary" size="small" @click="handleViewDetail(row)">详情</el-button>
                <el-button
                  v-if="canTransitionTo(row.status, 'approved')"
                  link
                  type="success"
                  size="small"
                  @click="handleApprove(row)"
                >
                  审核
                </el-button>
                <el-button
                  v-if="canTransitionTo(row.status, 'shipped')"
                  link
                  type="primary"
                  size="small"
                  @click="handleShip(row)"
                >
                  发货
                </el-button>
                <el-button
                  v-if="canTransitionTo(row.status, 'delivered')"
                  link
                  type="warning"
                  size="small"
                  @click="handleDelivered(row)"
                >
                  送达
                </el-button>
                <el-button
                  v-if="canTransitionTo(row.status, 'completed')"
                  link
                  type="success"
                  size="small"
                  @click="handleComplete(row)"
                >
                  完成
                </el-button>
                <el-button
                  v-if="canTransitionTo(row.status, 'cancelled')"
                  link
                  type="danger"
                  size="small"
                  @click="handleCancel(row)"
                >
                  取消
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <CrudDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :model-value="shipForm"
      :rules="shipFormRules"
      width="500px"
      @submit="handleShipSubmit"
    >
      <el-form-item label="物流公司" prop="logisticsCompany">
        <el-select v-model="shipForm.logisticsCompany" placeholder="请选择物流公司" style="width: 100%">
          <el-option
            v-for="item in LOGISTICS_COMPANIES"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="物流单号" prop="trackingNumber">
        <el-input v-model="shipForm.trackingNumber" placeholder="请输入物流单号" />
      </el-form-item>
    </CrudDialog>

    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="800px"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="ORDER_STATUS_MAP[currentOrder.status].type">
              {{ ORDER_STATUS_MAP[currentOrder.status].label }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="客户姓名">{{ currentOrder.customerName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.customerPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ currentOrder.customerAddress }}</el-descriptions-item>
          <el-descriptions-item label="物流公司" v-if="currentOrder.logisticsCompany">
            {{ currentOrder.logisticsCompany }}
          </el-descriptions-item>
          <el-descriptions-item label="物流单号" v-if="currentOrder.trackingNumber">
            {{ currentOrder.trackingNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="下单时间" :span="2">{{ currentOrder.createTime }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 20px 0 10px">商品明细</h4>
        <el-table :data="currentOrder.items" border stripe>
          <el-table-column prop="deviceName" label="商品名称" min-width="150" />
          <el-table-column prop="categoryName" label="分类" width="120" />
          <el-table-column prop="model" label="型号" width="120" />
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="unitPrice" label="单价" width="100" align="right">
            <template #default="{ row }">¥{{ row.unitPrice.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="subtotal" label="小计" width="120" align="right">
            <template #default="{ row }">¥{{ row.subtotal.toFixed(2) }}</template>
          </el-table-column>
        </el-table>

        <div style="margin-top: 20px; text-align: right; font-size: 16px">
          订单总计：
          <span style="color: #f56c6c; font-weight: 600; font-size: 18px">
            ¥{{ currentOrder.totalAmount.toFixed(2) }}
          </span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.order-page {
  height: 100%;
}

.order-detail {
  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}
</style>
