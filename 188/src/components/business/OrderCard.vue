<template>
  <div class="order-card">
    <div class="order-header">
      <div class="order-info">
        <span class="order-id">订单号：{{ order.id }}</span>
        <span class="order-time">{{ order.createTime }}</span>
      </div>
      <div class="order-status">
        <el-tag :type="getStatusType(order.status)">{{ order.statusText }}</el-tag>
      </div>
    </div>
    <div class="order-items">
      <div
        v-for="item in order.items"
        :key="item.productId"
        class="order-item-detail"
        @click="goToDetail(item.productId)"
      >
        <img :src="item.image" :alt="item.productName" />
        <div class="item-info">
          <h4 class="item-name text-ellipsis">{{ item.productName }}</h4>
          <p class="item-spec">{{ item.spec }}</p>
        </div>
        <div class="item-price">
          <span class="price">{{ item.price }}</span>
          <span class="item-quantity">x{{ item.quantity }}</span>
        </div>
      </div>
    </div>
    <div class="order-footer">
      <div class="order-total">
        共{{ order.items.length }}件商品，实付款：<span class="total-price">¥{{ order.totalAmount }}</span>
      </div>
      <div class="order-actions">
        <slot name="actions" :order="order">
          <el-button v-if="order.status === 'pending'" type="primary" size="small" @click.stop="payOrder(order)">
            立即付款
          </el-button>
          <el-button v-if="order.status === 'pending'" size="small" @click.stop="cancelOrder(order)">
            取消订单
          </el-button>
          <el-button v-if="order.status === 'shipped'" type="success" size="small" @click.stop="confirmOrder(order)">
            确认收货
          </el-button>
          <el-button v-if="order.tracking" size="small" @click.stop="viewTracking(order)">
            查看物流
          </el-button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['pay', 'cancel', 'confirm', 'tracking'])

const router = useRouter()

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'info',
    completed: 'success',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

const goToDetail = (productId) => {
  router.push({ name: 'ProductDetail', params: { id: productId } })
}

const payOrder = (order) => {
  ElMessageBox.confirm('确定要支付该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('pay', order)
  }).catch(() => {})
}

const cancelOrder = (order) => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('cancel', order)
  }).catch(() => {})
}

const confirmOrder = (order) => {
  ElMessageBox.confirm('确认已收到商品？', '提示', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('confirm', order)
  }).catch(() => {})
}

const viewTracking = (order) => {
  if (order.tracking) {
    ElMessage.info(`物流公司：${order.tracking.company}，物流单号：${order.tracking.number}`)
  }
}
</script>

<style lang="scss" scoped>
.order-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #f5f7fa;
    border-bottom: 1px solid #ebeef5;

    .order-info {
      display: flex;
      gap: 20px;

      .order-id {
        font-size: 13px;
        color: #606266;
      }

      .order-time {
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .order-items {
    padding: 16px 20px;

    .order-item-detail {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f5f7fa;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
      }

      .item-info {
        flex: 1;

        .item-name {
          font-size: 14px;
          color: #303133;
          margin-bottom: 8px;
        }

        .item-spec {
          font-size: 12px;
          color: #909399;
        }
      }

      .item-price {
        text-align: right;

        .price {
          font-size: 16px;
          font-weight: 600;
          color: #f56c6c;
          display: block;
          margin-bottom: 4px;
        }

        .item-quantity {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #fafafa;

    .order-total {
      font-size: 14px;
      color: #606266;

      .total-price {
        font-size: 18px;
        font-weight: 600;
        color: #f56c6c;
      }
    }

    .order-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
