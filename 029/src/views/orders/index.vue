<template>
  <div class="page-container">
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="订单状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            style="width: 140px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="item in orderStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input
            v-model="filterForm.keyword"
            placeholder="订单号/客人姓名/房间号"
            style="width: 220px"
            clearable
            @keyup.enter="handleFilterChange"
            @clear="handleFilterChange"
            @input="handleDebouncedFilter"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilterChange">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <div class="table-header">
        <div class="flex-between">
          <div>
            <h3 style="margin: 0; color: #303133">订单列表</h3>
            <el-tag type="info" style="margin-left: 12px">
              共 {{ hotelStore.filteredOrders.length }} 条
            </el-tag>
          </div>
          <el-button type="primary" @click="openBookingDialog">
            <el-icon><Plus /></el-icon>
            新建预订
          </el-button>
        </div>
      </div>

      <el-table
        :data="pagedOrders"
        stripe
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <el-table-column prop="orderNo" label="订单号" width="180" fixed="left">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewDetail(row)">
              {{ row.orderNo }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="roomNumber" label="房间号" width="90" />
        <el-table-column prop="guest.name" label="客人姓名" width="100" />
        <el-table-column prop="guest.phone" label="联系电话" width="130">
          <template #default="{ row }">
            {{ maskPhone(row.guest.phone) }}
          </template>
        </el-table-column>
        <el-table-column label="入住时间" width="120">
          <template #default="{ row }">
            {{ row.checkInDate }}
          </template>
        </el-table-column>
        <el-table-column label="退房时间" width="120">
          <template #default="{ row }">
            {{ row.checkOutDate }}
          </template>
        </el-table-column>
        <el-table-column label="入住天数" width="90">
          <template #default="{ row }">
            {{ row.nights }}晚
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="金额(元)" width="110">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 600">
              {{ formatCurrency(row.totalAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.status)" size="small">
              {{ getOrderStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === OrderStatus.PENDING_CHECKIN"
              type="primary"
              link
              size="small"
              @click="handleCheckIn(row)"
            >
              办理入住
            </el-button>
            <el-button
              v-if="row.status === OrderStatus.PENDING_CHECKIN"
              type="warning"
              link
              size="small"
              @click="handleCancelBooking(row)"
            >
              取消预订
            </el-button>
            <el-button
              v-if="row.status === OrderStatus.CHECKED_IN"
              type="success"
              link
              size="small"
              @click="handleCheckOut(row)"
            >
              退房结算
            </el-button>
            <el-button
              v-if="row.isOverdue && row.status === OrderStatus.CHECKED_IN"
              type="danger"
              link
              size="small"
              @click="handleForceCheckOut(row)"
            >
              强制退房
            </el-button>
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="hotelStore.filteredOrders.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </div>
  </div>

  <BookingDialog
    v-model="bookingDialogVisible"
    :room-id="selectedRoomId"
    @submit="handleBookingSubmit"
  />

  <OrderDetailDialog
    v-model="detailDialogVisible"
    :order="selectedOrder"
    @check-in="handleCheckIn"
    @check-out="handleCheckOut"
    @force-check-out="handleForceCheckOut"
  />
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  RoomStatus,
  OrderStatus,
  type Order,
  type Guest,
  type BookingFormData,
  type PriceEstimate
} from '@/types'
import {
  ORDER_STATUS_MAP,
  formatCurrency,
  maskPhone,
  generateId,
  debounce
} from '@/utils'
import { useHotelStore } from '@/stores/hotel'
import BookingDialog from '@/components/BookingDialog.vue'
import OrderDetailDialog from '@/components/OrderDetailDialog.vue'

const route = useRoute()
const hotelStore = useHotelStore()

const filterForm = reactive({
  status: null as OrderStatus | null,
  keyword: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

const bookingDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const selectedOrder = ref<Order | null>(null)
const selectedRoomId = ref('')

const orderStatusOptions = computed(() => {
  return Object.entries(ORDER_STATUS_MAP).map(([key, value]) => ({
    value: key,
    label: value.label
  }))
})

const pagedOrders = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return hotelStore.filteredOrders.slice(start, end)
})

const getOrderStatusText = (status: OrderStatus): string => {
  return ORDER_STATUS_MAP[status]?.label || '未知'
}

const getOrderStatusType = (
  status: OrderStatus
): 'warning' | 'primary' | 'success' | 'info' | 'danger' => {
  return ORDER_STATUS_MAP[status]?.type || 'info'
}

const getRowClassName = ({ row }: { row: Order }): string => {
  return row.isOverdue ? 'overdue-order' : ''
}

onMounted(() => {
  hotelStore.checkOverdueOrders()

  if (route.query.action === 'create' && route.query.roomId) {
    selectedRoomId.value = route.query.roomId as string
    bookingDialogVisible.value = true
  }

  if (route.query.status) {
    const status = route.query.status as OrderStatus
    if (Object.values(OrderStatus).includes(status)) {
      filterForm.status = status
      handleFilterChange()
    }
  }
})

const handleDebouncedFilter = debounce(() => {
  handleFilterChange()
}, 300)

const handleFilterChange = () => {
  hotelStore.setOrderFilters({
    status: filterForm.status,
    keyword: filterForm.keyword
  })
  pagination.currentPage = 1
}

const handleReset = () => {
  filterForm.status = null
  filterForm.keyword = ''
  hotelStore.clearFilters()
  pagination.currentPage = 1
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
}

const openBookingDialog = () => {
  selectedRoomId.value = ''
  bookingDialogVisible.value = true
}

const handleViewDetail = (order: Order) => {
  selectedOrder.value = order
  detailDialogVisible.value = true
}

const handleCheckIn = async (order: Order) => {
  try {
    await ElMessageBox.confirm(
      `确认为客人"${order.guest.name}"办理入住？`,
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const success = hotelStore.checkIn(order.id)
    if (success) {
      ElMessage.success('入住成功')
      detailDialogVisible.value = false
    } else {
      ElMessage.error('入住失败，请检查订单状态')
    }
  } catch {
    // 用户取消
  }
}

const handleCheckOut = async (order: Order) => {
  try {
    await ElMessageBox.confirm(
      `确认为客人"${order.guest.name}"办理退房？\n应付金额：${formatCurrency(order.totalAmount)}\n已付金额：${formatCurrency(order.paidAmount)}\n押金：${formatCurrency(order.deposit)}`,
      '退房结算',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const success = hotelStore.checkOut(order.id)
    if (success) {
      ElMessage.success('退房成功，房间已转入待清洁状态')
      detailDialogVisible.value = false
    } else {
      ElMessage.error('退房失败，请检查订单状态')
    }
  } catch {
    // 用户取消
  }
}

const handleForceCheckOut = async (order: Order) => {
  try {
    await ElMessageBox.confirm(
      `该订单已超时${order.overdueHours || 0}小时，确认强制执行退房？`,
      '强制退房',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )

    const success = hotelStore.forceCheckOut(order.id)
    if (success) {
      ElMessage.success('强制退房成功')
      detailDialogVisible.value = false
    } else {
      ElMessage.error('强制退房失败，请检查订单状态')
    }
  } catch {
    // 用户取消
  }
}

const handleCancelBooking = async (order: Order) => {
  try {
    await ElMessageBox.confirm(
      `确认取消客人"${order.guest.name}"的预订订单？`,
      '取消预订',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const success = hotelStore.cancelBooking(order.id)
    if (success) {
      ElMessage.success('预订已取消，房间已释放')
      detailDialogVisible.value = false
    } else {
      ElMessage.error('取消预订失败，请检查订单状态')
    }
  } catch {
    // 用户取消
  }
}

const handleBookingSubmit = (
  data: BookingFormData & { priceEstimate: PriceEstimate }
) => {
  const selectedRoom = hotelStore.getRoomById(data.roomId)
  if (!selectedRoom) {
    ElMessage.error('房间不存在或已被占用')
    return
  }

  if (selectedRoom.status !== RoomStatus.VACANT) {
    ElMessage.error('该房间当前不可用，请选择其他房间')
    return
  }

  const guest: Guest = {
    id: generateId('guest_'),
    name: data.guestName,
    idCard: data.idCard,
    phone: data.phone,
    gender: data.guestGender,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }

  const newOrder = hotelStore.createBooking({
    roomId: data.roomId,
    guest,
    checkInDate: data.checkInDate,
    checkOutDate: data.checkOutDate,
    nights: data.nights,
    totalAmount: data.priceEstimate.subtotal,
    deposit: data.deposit,
    remark: data.remark
  })

  if (newOrder) {
    ElMessage.success('预订成功')
    bookingDialogVisible.value = false
  } else {
    ElMessage.error('预订失败，该房间可能已被占用')
  }
}
</script>

<style lang="scss" scoped>
.filter-form {
  margin-bottom: 0;
}

.table-header {
  margin-bottom: 16px;
}

.table-container {
  :deep(.el-table__row.overdue-order) {
    background-color: #fef0f0 !important;
  }

  :deep(.el-table__row--striped.overdue-order) {
    background-color: #fde2e2 !important;
  }
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
