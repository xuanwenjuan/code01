<template>
  <el-dialog
    v-model="visible"
    title="订单详情"
    width="600px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div v-if="order" class="order-detail">
      <div class="order-header">
        <div class="order-title">
          <h3 style="margin: 0">订单信息</h3>
          <el-tag :type="getOrderStatusType(order.status)" size="large">
            {{ getOrderStatusText(order.status) }}
          </el-tag>
        </div>
        <span class="order-no" style="font-family: monospace; font-weight: 600">{{ order.orderNo }}</span>
      </div>

      <el-divider />

      <el-descriptions :column="2" border>
        <el-descriptions-item label="房间号" :span="2">
          <el-tag type="primary" size="large">{{ order.roomNumber }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客人姓名">{{ order.guest.name }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ order.guest.phone }}</el-descriptions-item>
        <el-descriptions-item label="客人性别">
          {{ order.guest.gender === 'male' ? '男' : '女' }}
        </el-descriptions-item>
        <el-descriptions-item label="身份证号">
          {{ maskIdCard(order.guest.idCard) }}
        </el-descriptions-item>
        <el-descriptions-item label="入住日期" :span="2">
          <div class="date-range">
            <el-icon><Calendar /></el-icon>
            <span>{{ order.checkInDate }}</span>
            <el-icon><ArrowRight /></el-icon>
            <span>{{ order.checkOutDate }}</span>
            <el-tag type="warning" size="small">
              {{ order.nights }}晚
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="实际入住">
          {{ order.actualCheckIn || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="实际退房">
          {{ order.actualCheckOut || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span style="color: #f56c6c; font-weight: 600">
            {{ formatCurrency(order.totalAmount) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="已付金额">
          <span style="color: #67c23a; font-weight: 600">
            {{ formatCurrency(order.paidAmount) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="押金">
          {{ formatCurrency(order.deposit) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ order.createBy }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ order.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ order.remark || '无' }}
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="order.isOverdue" style="margin-top: 16px">
        <el-alert
          type="error"
          :closable="false"
          show-icon
        >
          <template #title>
            <strong>超时提醒</strong>
          </template>
          该订单已超过退房时间 {{ order.overdueHours || 0 }} 小时，请及时处理。
        </el-alert>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-actions">
          <el-button
            v-if="order?.status === 'pending_checkin'"
            type="primary"
            @click="handleCheckIn"
          >
            办理入住
          </el-button>
          <el-button
            v-if="order?.status === 'checked_in'"
            type="success"
            @click="handleCheckOut"
          >
            退房结算
          </el-button>
          <el-button
            v-if="order?.isOverdue && order?.status === 'checked_in'"
            type="danger"
            @click="handleForceCheckOut"
          >
            强制退房
          </el-button>
        </div>
        <el-button @click="visible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { OrderStatus, type Order } from '@/types'
import { ORDER_STATUS_MAP, formatCurrency, maskIdCard } from '@/utils'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object as PropType<Order | null>,
    default: null
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'checkIn', order: Order): void
  (e: 'checkOut', order: Order): void
  (e: 'forceCheckOut', order: Order): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const getOrderStatusText = (status: OrderStatus): string => {
  return ORDER_STATUS_MAP[status]?.label || '未知'
}

const getOrderStatusType = (
  status: OrderStatus
): 'warning' | 'primary' | 'success' | 'info' | 'danger' => {
  return ORDER_STATUS_MAP[status]?.type || 'info'
}

const handleCheckIn = () => {
  if (props.order) {
    emit('checkIn', props.order)
  }
}

const handleCheckOut = () => {
  if (props.order) {
    emit('checkOut', props.order)
  }
}

const handleForceCheckOut = () => {
  if (props.order) {
    emit('forceCheckOut', props.order)
  }
}
</script>

<style lang="scss" scoped>
.order-detail {
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .order-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .order-no {
      font-size: 18px;
      color: #409eff;
    }
  }

  .date-range {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      color: #909399;
    }
  }

  :deep(.el-descriptions__label) {
    background: #f5f7fa;
    font-weight: 500;
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .footer-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
