<template>
  <div class="order-list">
    <el-tabs v-model="activeTab" class="order-tabs">
      <el-tab-pane label="全部订单" name="all">
        <template #label>
          <span>全部订单</span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="待付款" name="pending">
        <template #label>
          <span>待付款</span>
          <el-badge v-if="pendingCount > 0" :value="pendingCount" class="tab-badge" />
        </template>
      </el-tab-pane>
      <el-tab-pane label="已完成" name="completed">
        <template #label>
          <span>已完成</span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="已取消" name="cancelled">
        <template #label>
          <span>已取消</span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <div class="order-items" v-loading="orderStore.loading">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-item"
      >
        <div class="order-header">
          <div class="order-info">
            <span class="order-no">订单号: {{ order.orderNo }}</span>
            <span class="order-time">{{ formatDateTime(order.createdAt) }}</span>
          </div>
          <el-tag :type="getStatusType(order.status)" effect="light">
            {{ getStatusText(order.status) }}
          </el-tag>
        </div>
        <div class="order-content">
          <div class="order-product">
            <img :src="order.plantImage" :alt="order.plantName" class="product-img" />
            <div class="product-info">
              <h4 class="product-name">{{ order.plantName }}</h4>
              <p class="product-spec">规格: {{ order.spec }}</p>
              <p class="product-quantity">数量: {{ order.quantity }}</p>
            </div>
          </div>
          <div class="order-price">
            <span class="price-label">实付款</span>
            <span class="price-value">¥{{ order.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
        <div class="order-actions">
          <el-button
            v-if="order.status === 'pending'"
            type="primary"
            size="small"
            @click="handlePay(order)"
          >
            立即付款
          </el-button>
          <el-button
            v-if="order.status === 'pending'"
            size="small"
            @click="handleCancel(order.id)"
          >
            取消订单
          </el-button>
          <el-button
            v-if="order.status === 'paid'"
            type="success"
            size="small"
            @click="handleConfirm(order.id)"
          >
            确认收货
          </el-button>
          <el-button size="small" @click="handleDelete(order.id)">
            删除订单
          </el-button>
        </div>
      </div>
    </div>

    <EmptyState
      v-if="!orderStore.loading && filteredOrders.length === 0"
      description="暂无订单"
      show-action
      action-text="去逛逛"
      @action="$router.push('/')"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDateTime, getStatusText, getStatusType } from '@/utils/validate'
import EmptyState from '@/components/EmptyState.vue'

const orderStore = useOrderStore()
const activeTab = ref('all')

const orders = computed(() => orderStore.userOrders)

const pendingCount = computed(() => 
  orders.value.filter(o => o.status === 'pending').length
)

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter(o => o.status === activeTab.value)
})

const handlePay = (order) => {
  ElMessageBox.confirm('确认支付该订单吗？', '支付确认', {
    confirmButtonText: '确认支付',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    orderStore.updateOrderStatus(order.id, 'paid')
    ElMessage.success('支付成功')
  }).catch(() => {})
}

const handleCancel = (orderId) => {
  ElMessageBox.confirm('确认取消该订单吗？', '取消确认', {
    confirmButtonText: '确认取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    orderStore.cancelOrder(orderId)
    ElMessage.success('订单已取消')
  }).catch(() => {})
}

const handleConfirm = (orderId) => {
  ElMessageBox.confirm('确认收货吗？', '收货确认', {
    confirmButtonText: '确认收货',
    cancelButtonText: '再等等',
    type: 'success'
  }).then(() => {
    orderStore.updateOrderStatus(orderId, 'completed')
    ElMessage.success('已确认收货')
  }).catch(() => {})
}

const handleDelete = (orderId) => {
  ElMessageBox.confirm('确认删除该订单吗？此操作不可恢复', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    const result = orderStore.deleteOrder(orderId)
    if (result.success) {
      ElMessage.success(result.message)
    } else {
      ElMessage.error(result.message)
    }
  }).catch(() => {})
}

onMounted(() => {
  orderStore.fetchOrders()
})
</script>

<style scoped>
.order-tabs {
  margin-bottom: 20px;
}

.tab-badge {
  margin-left: 8px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #666;
}

.order-no {
  font-weight: 500;
  color: #333;
}

.order-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.order-product {
  display: flex;
  gap: 15px;
  flex: 1;
}

.product-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.product-info p {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
}

.order-price {
  text-align: right;
}

.price-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.price-value {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid #eee;
}
</style>
