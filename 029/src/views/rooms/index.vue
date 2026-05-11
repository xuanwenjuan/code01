<template>
  <div class="page-container">
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="楼层">
          <el-select
            v-model="filterForm.floor"
            placeholder="全部楼层"
            clearable
            style="width: 140px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="floor in availableFloors"
              :key="floor"
              :label="`${floor}楼`"
              :value="floor"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房型">
          <el-select
            v-model="filterForm.roomType"
            placeholder="全部房型"
            clearable
            style="width: 160px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="roomType in hotelStore.roomTypes"
              :key="roomType.code"
              :label="roomType.name"
              :value="roomType.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            style="width: 140px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="item in roomStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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

    <div class="status-legend">
      <div class="legend-item">
        <span class="legend-dot vacant"></span>
        <span>空闲</span>
        <el-tag size="small">{{ hotelStore.statistics.vacantRooms }}</el-tag>
      </div>
      <div class="legend-item">
        <span class="legend-dot booked"></span>
        <span>已预订</span>
        <el-tag size="small">{{ hotelStore.statistics.bookedRooms }}</el-tag>
      </div>
      <div class="legend-item">
        <span class="legend-dot occupied"></span>
        <span>入住中</span>
        <el-tag size="small">{{ hotelStore.statistics.occupiedRooms }}</el-tag>
      </div>
      <div class="legend-item">
        <span class="legend-dot cleaning"></span>
        <span>打扫中</span>
        <el-tag size="small">{{ hotelStore.statistics.cleaningRooms }}</el-tag>
      </div>
      <div class="legend-item total">
        <span>总计</span>
        <el-tag type="primary" size="small">{{ hotelStore.statistics.totalRooms }}</el-tag>
      </div>
    </div>

    <div v-for="floorData in hotelStore.roomsByFloor" :key="floorData.floor" class="floor-section">
      <div class="floor-header">
        <el-icon style="font-size: 20px"><OfficeBuilding /></el-icon>
        <span class="floor-title">{{ floorData.floor }}楼</span>
        <span class="floor-count">共 {{ floorData.rooms.length }} 间房</span>
      </div>
      <el-row :gutter="16">
        <el-col
          v-for="room in floorData.rooms"
          :key="room.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
          style="margin-bottom: 16px"
        >
          <el-card
            class="room-card"
            :class="room.status"
            shadow="hover"
            @click="handleRoomClick(room)"
          >
            <div class="room-header">
              <span class="room-number">{{ room.roomNumber }}</span>
              <el-tag :type="getStatusTagType(room.status)" size="small">
                {{ getStatusText(room.status) }}
              </el-tag>
            </div>
            <div class="room-info">
              <p class="room-type">
                <el-icon><House /></el-icon>
                {{ getRoomTypeName(room.typeCode) }}
              </p>
              <p class="room-price">
                <el-icon><Money /></el-icon>
                {{ formatCurrency(getRoomTypePrice(room.typeCode)) }}/晚
              </p>
            </div>
            <div class="room-footer">
              <span class="clean-time">
                <el-icon><Clock /></el-icon>
                {{ room.lastCleanedAt }}
              </span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty v-if="hotelStore.roomsByFloor.length === 0" description="暂无符合条件的客房" />

    <el-dialog v-model="roomDetailVisible" title="客房详情" width="520px">
      <div v-if="selectedRoom" class="room-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="房间号">{{ selectedRoom.roomNumber }}</el-descriptions-item>
          <el-descriptions-item label="楼层">{{ selectedRoom.floor }}楼</el-descriptions-item>
          <el-descriptions-item label="房型">
            {{ getRoomTypeName(selectedRoom.typeCode) }}
          </el-descriptions-item>
          <el-descriptions-item label="房态">
            <el-tag :type="getStatusTagType(selectedRoom.status)" size="small">
              {{ getStatusText(selectedRoom.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="价格" :span="2">
            <span style="color: #f56c6c; font-weight: 600; font-size: 16px">
              {{ formatCurrency(getRoomTypePrice(selectedRoom.typeCode)) }}/晚
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="上次清洁" :span="2">
            {{ selectedRoom.lastCleanedAt }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ selectedRoom.notes || '无' }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="relatedOrder" class="order-info" style="margin-top: 16px">
          <el-alert
            :type="relatedOrder.isOverdue ? 'error' : 'info'"
            :closable="false"
            show-icon
          >
            <template #title>
              <strong>关联订单</strong>
            </template>
            订单号：{{ relatedOrder.orderNo }} | 客人：{{ relatedOrder.guest.name }} |
            状态：{{ getOrderStatusText(relatedOrder.status) }}
            <el-button
              type="primary"
              link
              size="small"
              @click="goToOrderDetail"
            >
              查看详情
            </el-button>
          </el-alert>
        </div>

        <div class="room-actions" style="margin-top: 20px">
          <el-button
            v-if="selectedRoom.status === RoomStatus.VACANT"
            type="primary"
            @click="openBookingDialog"
          >
            <el-icon><Plus /></el-icon>
            创建预订
          </el-button>
          <el-button
            v-if="selectedRoom.status === RoomStatus.CLEANING"
            type="success"
            @click="handleMarkClean"
          >
            <el-icon><CircleCheck /></el-icon>
            标记为已清洁
          </el-button>
          <el-button
            v-if="
              selectedRoom.status === RoomStatus.OCCUPIED ||
              selectedRoom.status === RoomStatus.BOOKED
            "
            type="warning"
            @click="goToOrders"
          >
            <el-icon><Tickets /></el-icon>
            查看订单
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>

  <BookingDialog
    v-model="bookingDialogVisible"
    :room-id="selectedRoomId"
    @submit="handleBookingSubmit"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  RoomStatus,
  RoomType,
  OrderStatus,
  type Room,
  type Guest,
  type Order,
  type BookingFormData,
  type PriceEstimate
} from '@/types'
import {
  ROOM_STATUS_MAP,
  ORDER_STATUS_MAP,
  formatCurrency,
  generateId
} from '@/utils'
import { useHotelStore } from '@/stores/hotel'
import BookingDialog from '@/components/BookingDialog.vue'

const router = useRouter()
const hotelStore = useHotelStore()

const filterForm = reactive({
  floor: null as number | null,
  roomType: null as RoomType | null,
  status: null as RoomStatus | null
})

const roomDetailVisible = ref(false)
const bookingDialogVisible = ref(false)
const selectedRoom = ref<Room | null>(null)
const selectedRoomId = ref('')

const roomStatusOptions = computed(() => {
  return Object.entries(ROOM_STATUS_MAP).map(([key, value]) => ({
    value: key,
    label: value.label
  }))
})

const availableFloors = computed(() => {
  const floors = new Set(hotelStore.rooms.map((r) => r.floor))
  return Array.from(floors).sort((a, b) => a - b)
})

const relatedOrder = computed((): Order | undefined => {
  if (!selectedRoom.value) return undefined
  return hotelStore.getActiveOrderForRoom(selectedRoom.value.id)
})

const getStatusText = (status: RoomStatus): string => {
  return ROOM_STATUS_MAP[status]?.label || '未知'
}

const getStatusTagType = (
  status: RoomStatus
): 'success' | 'warning' | 'primary' | 'info' => {
  return ROOM_STATUS_MAP[status]?.type || 'info'
}

const getRoomTypeName = (typeCode: RoomType): string => {
  const roomType = hotelStore.getRoomTypeByCode(typeCode)
  return roomType?.name || '未知房型'
}

const getRoomTypePrice = (typeCode: RoomType): number => {
  const roomType = hotelStore.getRoomTypeByCode(typeCode)
  return roomType?.price || 0
}

const getOrderStatusText = (status: OrderStatus): string => {
  return ORDER_STATUS_MAP[status]?.label || '未知'
}

const handleFilterChange = () => {
  hotelStore.setRoomFilters({
    floor: filterForm.floor,
    roomType: filterForm.roomType,
    status: filterForm.status
  })
}

const handleReset = () => {
  filterForm.floor = null
  filterForm.roomType = null
  filterForm.status = null
  hotelStore.clearFilters()
}

const handleRoomClick = (room: Room) => {
  selectedRoom.value = room
  roomDetailVisible.value = true
}

const openBookingDialog = () => {
  if (!selectedRoom.value) return
  selectedRoomId.value = selectedRoom.value.id
  roomDetailVisible.value = false
  bookingDialogVisible.value = true
}

const goToOrders = () => {
  if (!selectedRoom.value) return
  roomDetailVisible.value = false
  router.push({ path: '/orders', query: { roomId: selectedRoom.value.id } })
}

const goToOrderDetail = () => {
  roomDetailVisible.value = false
  router.push({ path: '/orders' })
}

const handleMarkClean = async () => {
  if (!selectedRoom.value) return

  try {
    await ElMessageBox.confirm('确认将此房间标记为已清洁？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const success = hotelStore.markRoomClean(selectedRoom.value.id)
    if (success) {
      ElMessage.success('房间已标记为空闲')
      roomDetailVisible.value = false
    } else {
      ElMessage.error('操作失败，请检查房间状态')
    }
  } catch {
    // 用户取消
  }
}

const handleBookingSubmit = (
  data: BookingFormData & { priceEstimate: PriceEstimate }
) => {
  const selectedRoomObj = hotelStore.getRoomById(data.roomId)
  if (!selectedRoomObj) {
    ElMessage.error('房间不存在或已被占用')
    return
  }

  if (selectedRoomObj.status !== RoomStatus.VACANT) {
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

.status-legend {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;

    &.total {
      margin-left: auto;
      font-weight: 600;
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;

      &.vacant {
        background: #67c23a;
      }

      &.booked {
        background: #e6a23c;
      }

      &.occupied {
        background: #409eff;
      }

      &.cleaning {
        background: #909399;
      }
    }

    span {
      font-size: 14px;
      color: #606266;
    }
  }
}

.floor-section {
  margin-bottom: 24px;

  .floor-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e4e7ed;

    .floor-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .floor-count {
      font-size: 14px;
      color: #909399;
    }
  }
}

.room-card {
  cursor: pointer;
  transition: all 0.3s ease;

  :deep(.el-card__body) {
    padding: 16px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.vacant {
    border-left: 4px solid #67c23a;
  }

  &.booked {
    border-left: 4px solid #e6a23c;
  }

  &.occupied {
    border-left: 4px solid #409eff;
  }

  &.cleaning {
    border-left: 4px solid #909399;
  }

  .room-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .room-number {
      font-size: 20px;
      font-weight: 700;
      color: #303133;
    }
  }

  .room-info {
    margin-bottom: 12px;

    p {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      font-size: 14px;
      color: #606266;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .room-price {
      color: #f56c6c;
      font-weight: 600;
    }
  }

  .room-footer {
    .clean-time {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #909399;
    }
  }
}

.room-detail {
  :deep(.el-descriptions__label) {
    background: #f5f7fa;
    font-weight: 500;
  }

  .room-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}
</style>
