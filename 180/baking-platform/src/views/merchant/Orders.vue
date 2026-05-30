<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { mockOrders } from '../../mock/orders'
import LoadingState from '../../components/common/LoadingState.vue'
import EmptyState from '../../components/common/EmptyState.vue'

const loading = ref(false)
const orders = ref([])

const statusList = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待付款' },
  { value: 'shipping', label: '配送中' },
  { value: 'delivered', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const activeStatus = ref('')

onMounted(async () => {
  loading.value = true
  setTimeout(() => {
    orders.value = mockOrders
    loading.value = false
  }, 500)
})

const filteredOrders = () => {
  if (!activeStatus.value) {
    return orders.value
  }
  return orders.value.filter(o => o.status === activeStatus.value)
}

function getStatusColor(status) {
  const colors = {
    pending: 'warning',
    shipping: 'primary',
    delivered: 'success',
    cancelled: 'info'
  }
  return colors[status] || 'info'
}

function shipOrder(order) {
  ElMessage.success(`订单 ${order.orderNo} 已发货`)
  order.status = 'shipping'
  order.statusText = '配送中'
}
</script>

<template>
  <div class="merchant-orders-page">
    <div class="page-header flex-between">
      <h2 class="page-title">订单管理</h2>
      <el-button type="primary">导出订单</el-button>
    </div>
    
    <div class="status-tabs">
      <el-radio-group v-model="activeStatus" size="large">
        <el-radio-button 
          v-for="status in statusList" 
          :key="status.value" 
          :value="status.value"
        >
          {{ status.label }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <LoadingState v-if="loading" text="订单加载中..." />
    <EmptyState v-else-if="filteredOrders().length === 0" text="暂无订单" />
    <div v-else class="order-list">
      <div v-for="order in filteredOrders()" :key="order.id" class="order-card">
        <div class="order-header flex-between">
        <div class="order-info">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <span class="order-time">{{ new Date(order.createdAt).toLocaleString() }}</span>
          <span class="order-buyer">买家：{{ order.address.name }}</span>
        </div>
        <el-tag :type="getStatusColor(order.status)" effect="light">
          {{ order.statusText }}
        </el-tag>
      </div>
      <div class="order-items">
        <div 
          v-for="item in order.items" 
          :key="item.productId" 
          class="order-item"
        >
          <img :src="item.productImage" :alt="item.productName" />
          <div class="item-info">
            <h4 class="item-name">{{ item.productName }}</h4>
            <p class="item-spec">{{ item.specName }}</p>
          </div>
          <div class="item-price">¥{{ item.price.toFixed(2) }}</div>
          <div class="item-quantity">x{{ item.quantity }}</div>
          <div class="item-subtotal">¥{{ item.subtotal.toFixed(2) }}</div>
        </div>
      </div>
      <div class="order-footer flex-between">
        <div class="order-actions">
          <el-button 
            v-if="order.status === 'pending'" 
            type="primary" 
            size="small"
            @click="shipOrder(order)"
          >
            确认发货
          </el-button>
          <el-button v-if="order.status === 'shipping'" type="success" size="small">
            查看物流
          </el-button>
          <el-button type="info" size="small">查看详情</el-button>
        </div>
        <div class="order-total">
          <span>共{{ order.items.reduce((sum, item) => sum + item.quantity, 0) }}件商品，合计：</span>
          <span class="total-price">¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.merchant-orders-page {
}

.status-tabs {
  margin-bottom: 20px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  background: #f5f7fa;
  padding: 12px 20px;
  display: flex;
  align-items: center;
}

.order-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #606266;
}

.order-no {
  color: #303133;
  font-weight: 500;
}

.order-items {
  padding: 16px 20px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #ebeef5;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
}

.item-spec {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.item-price,
.item-quantity {
  width: 100px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.item-subtotal {
  width: 120px;
  text-align: right;
  font-size: 14px;
  font-weight: 500;
  color: #f56c6c;
}

.order-footer {
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  align-items: center;
}

.order-total {
  font-size: 14px;
  color: #606266;
}

.total-price {
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
  margin-left: 8px;
}
</style>
