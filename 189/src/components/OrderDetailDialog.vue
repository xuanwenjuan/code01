<template>
  <el-dialog
    v-model="visible"
    title="订单详情"
    width="680px"
    @close="handleClose"
  >
    <template v-if="order">
      <el-descriptions :column="2" border class="info-section">
        <el-descriptions-item label="订单号">
          <span class="order-id">{{ order.id }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(order.status)" effect="light" size="large">
            {{ order.statusText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ order.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ order.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发货时间">{{ order.shipTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收货时间">{{ order.receiveTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="采购方" v-if="order.buyerWorkshop">
          {{ order.buyerWorkshop }}
        </el-descriptions-item>
        <el-descriptions-item label="联系人" v-if="order.buyerName">
          {{ order.buyerName }}
        </el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">
          {{ order.address?.name }} {{ order.address?.phone }}<br/>
          {{ order.address?.address }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="section-title">商品信息</div>
      <table class="product-table">
        <thead>
          <tr>
            <th>商品名称</th>
            <th width="120">单价</th>
            <th width="100">数量</th>
            <th width="120">小计</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.products" :key="item.id">
            <td>{{ item.name }}</td>
            <td>¥{{ item.price }}/{{ item.unit }}</td>
            <td>×{{ item.quantity }}</td>
            <td class="subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="total-section">
        <span class="total-label">订单总额：</span>
        <span class="total-amount">¥{{ order.totalAmount.toFixed(2) }}</span>
      </div>

      <div v-if="order.tracking" class="tracking-section">
        <div class="section-title">物流信息</div>
        <div class="tracking-info">
          <p>
            <span class="label">物流公司：</span>
            <span>{{ order.tracking.company }}</span>
          </p>
          <p>
            <span class="label">物流单号：</span>
            <span class="tracking-number">{{ order.tracking.number }}</span>
            <el-button 
              type="primary" 
              link 
              size="small"
              @click="copyTrackingNumber"
            >
              复制单号
            </el-button>
          </p>
        </div>
      </div>

      <div class="timeline-section" v-if="orderTimeline.length > 0">
        <div class="section-title">订单轨迹</div>
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in orderTimeline"
            :key="index"
            :timestamp="item.time"
            :type="item.type"
            :icon="item.icon"
          >
            {{ item.label }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </template>

    <template #footer>
      <slot name="footer">
        <el-button @click="handleClose">关闭</el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function getStatusType(status) {
  const types = {
    unpaid: 'warning',
    pending: 'primary',
    shipping: 'info',
    delivered: 'success'
  }
  return types[status] || 'info'
}

const orderTimeline = computed(() => {
  if (!props.order) return []
  const timeline = []
  
  if (props.order.createTime) {
    timeline.push({
      time: props.order.createTime,
      label: '订单已创建',
      type: 'primary',
      icon: 'ShoppingCart'
    })
  }
  if (props.order.payTime) {
    timeline.push({
      time: props.order.payTime,
      label: '订单已支付',
      type: 'success',
      icon: 'CreditCard'
    })
  }
  if (props.order.shipTime) {
    timeline.push({
      time: props.order.shipTime,
      label: '商品已发货',
      type: 'warning',
      icon: 'Truck'
    })
  }
  if (props.order.receiveTime) {
    timeline.push({
      time: props.order.receiveTime,
      label: '订单已完成',
      type: 'success',
      icon: 'CircleCheck'
    })
  }
  
  return timeline
})

function copyTrackingNumber() {
  if (props.order?.tracking?.number) {
    navigator.clipboard.writeText(props.order.tracking.number)
    ElMessage.success('已复制物流单号')
  }
}

function handleClose() {
  emit('close')
  visible.value = false
}
</script>

<style lang="scss" scoped>
.info-section {
  margin-bottom: 24px;

  .order-id {
    font-family: monospace;
    font-weight: 600;
  }
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-color;
  margin: 20px 0 12px;
  padding-left: 10px;
  border-left: 3px solid $primary-color;
}

.product-table {
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid $border-color;
  }

  th {
    background: #fafafa;
    font-weight: 500;
    color: $text-light;
  }

  .subtotal {
    color: $danger-color;
    font-weight: 600;
  }
}

.total-section {
  text-align: right;
  padding: 16px;
  background: #fafafa;
  border-radius: 0 0 8px 8px;
  margin-bottom: 16px;

  .total-label {
    font-size: 14px;
    color: $text-light;
  }

  .total-amount {
    font-size: 24px;
    font-weight: 700;
    color: $danger-color;
  }
}

.tracking-section {
  .tracking-info {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    p {
      margin-bottom: 8px;
      font-size: 14px;
      color: $text-color;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: $text-light;
        margin-right: 8px;
      }

      .tracking-number {
        font-family: monospace;
        font-weight: 500;
      }
    }
  }
}

.timeline-section {
  margin-top: 20px;
}
</style>
