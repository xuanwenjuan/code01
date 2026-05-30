<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../stores/user'
import { useOrderStore } from '../../stores/order'
import LoadingState from '../../components/common/LoadingState.vue'
import EmptyState from '../../components/common/EmptyState.vue'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

const statusList = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待付款' },
  { value: 'shipping', label: '配送中' },
  { value: 'delivered', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const activeStatus = ref('')
const showDetail = ref(false)
const currentOrder = ref(null)

onMounted(async () => {
  await orderStore.fetchOrders(userStore.userInfo.id)
})

const filteredOrders = computed(() => {
  if (!activeStatus.value) {
    return orderStore.orders
  }
  return orderStore.orders.filter(o => o.status === activeStatus.value)
})

function getStatusColor(status) {
  const colors = {
    pending: 'warning',
    shipping: 'primary',
    delivered: 'success',
    cancelled: 'info'
  }
  return colors[status] || 'info'
}

function viewOrderDetail(order) {
  currentOrder.value = order
  showDetail.value = true
}

async function cancelOrder(order) {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      type: 'warning'
    })
    await orderStore.updateOrderStatus(order.id, 'cancelled')
    ElMessage.success('订单已取消')
  } catch {}
}

async function payOrder(order) {
  try {
    await ElMessageBox.confirm(`确认支付 ¥${order.totalAmount.toFixed(2)} 吗？`, '支付确认', {
      confirmButtonText: '确认支付',
      cancelButtonText: '取消',
      type: 'success'
    })
    await orderStore.updateOrderStatus(order.id, 'shipping')
    ElMessage.success('支付成功，商家已安排发货')
  } catch {}
}

async function confirmReceive(order) {
  try {
    await ElMessageBox.confirm('确认已收到商品吗？', '确认收货', {
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
      type: 'success'
    })
    await orderStore.updateOrderStatus(order.id, 'delivered')
    ElMessage.success('已确认收货')
  } catch {}
}

function goToProduct(productId) {
  showDetail.value = false
  router.push(`/product/${productId}`)
}

function buyAgain(item) {
  showDetail.value = false
  router.push(`/product/${item.productId}`)
}
</script>

<template>
  <div class="orders-page">
    <div class="page-header flex-between">
      <h2 class="page-title">我的订单</h2>
      <span class="order-count">共{{ orderStore.orders.length }}个订单</span>
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

    <LoadingState v-if="orderStore.loading" text="订单加载中..." />
    <EmptyState 
      v-else-if="filteredOrders.length === 0" 
      text="暂无订单" 
      description="快去选购心仪的商品吧" 
    />
    <div v-else class="order-list">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header flex-between">
          <div class="order-info">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <span class="order-time">下单时间：{{ new Date(order.createdAt).toLocaleString() }}</span>
            <span v-if="order.paidAt" class="order-pay-time">
              支付时间：{{ new Date(order.paidAt).toLocaleString() }}
            </span>
          </div>
          <el-tag :type="getStatusColor(order.status)" effect="light" size="large">
            {{ order.statusText }}
          </el-tag>
        </div>
        <div class="order-items">
          <div 
            v-for="item in order.items" 
            :key="item.productId" 
            class="order-item"
            @click="viewOrderDetail(order)"
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
            <el-button size="small" @click="viewOrderDetail(order)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            <el-button 
              v-if="order.status === 'pending'" 
              type="primary" 
              size="small"
              @click="payOrder(order)"
            >
              <el-icon><Money /></el-icon>
              立即支付
            </el-button>
            <el-button 
              v-if="order.status === 'pending'" 
              type="danger" 
              size="small" 
              plain
              @click="cancelOrder(order)"
            >
              取消订单
            </el-button>
            <el-button 
              v-if="order.status === 'shipping'" 
              type="success" 
              size="small"
              @click="confirmReceive(order)"
            >
              <el-icon><CircleCheck /></el-icon>
              确认收货
            </el-button>
            <el-button 
              v-if="order.status === 'delivered'" 
              type="success" 
              size="small"
              plain
              @click="buyAgain(order.items[0])"
            >
              再次购买
            </el-button>
          </div>
          <div class="order-total">
            <span>共{{ order.items.reduce((sum, item) => sum + item.quantity, 0) }}件商品，合计：</span>
            <span class="total-price">¥{{ order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog 
      v-model="showDetail" 
      title="订单详情" 
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-section">
          <h4><el-icon><List /></el-icon> 订单信息</h4>
          <div class="detail-row">
            <span class="label">订单号：</span>
            <span class="value">{{ currentOrder.orderNo }}</span>
          </div>
          <div class="detail-row">
            <span class="label">订单状态：</span>
            <el-tag :type="getStatusColor(currentOrder.status)" size="small">
              {{ currentOrder.statusText }}
            </el-tag>
          </div>
          <div class="detail-row">
            <span class="label">下单时间：</span>
            <span class="value">{{ new Date(currentOrder.createdAt).toLocaleString() }}</span>
          </div>
          <div v-if="currentOrder.paidAt" class="detail-row">
            <span class="label">支付时间：</span>
            <span class="value">{{ new Date(currentOrder.paidAt).toLocaleString() }}</span>
          </div>
          <div v-if="currentOrder.shippedAt" class="detail-row">
            <span class="label">发货时间：</span>
            <span class="value">{{ new Date(currentOrder.shippedAt).toLocaleString() }}</span>
          </div>
          <div v-if="currentOrder.deliveredAt" class="detail-row">
            <span class="label">完成时间：</span>
            <span class="value">{{ new Date(currentOrder.deliveredAt).toLocaleString() }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4><el-icon><Location /></el-icon> 收货地址</h4>
          <div class="address-info">
            <p><strong>{{ currentOrder.address.name }}</strong> {{ currentOrder.address.phone }}</p>
            <p>{{ currentOrder.address.address }}</p>
          </div>
        </div>

        <div class="detail-section">
          <h4><el-icon><Goods /></el-icon> 商品信息</h4>
          <div class="detail-items">
            <div 
              v-for="item in currentOrder.items" 
              :key="item.productId" 
              class="detail-item"
              @click="goToProduct(item.productId)"
            >
              <img :src="item.productImage" :alt="item.productName" />
              <div class="item-info">
                <p class="item-name">{{ item.productName }}</p>
                <p class="item-spec">{{ item.specName }}</p>
              </div>
              <div class="item-price">¥{{ item.price.toFixed(2) }}</div>
              <div class="item-quantity">x{{ item.quantity }}</div>
              <div class="item-subtotal">¥{{ item.subtotal.toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section price-summary">
          <div class="price-row">
            <span>商品金额：</span>
            <span>¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
          </div>
          <div class="price-row">
            <span>运费：</span>
            <span>{{ currentOrder.shippingFee > 0 ? '¥' + currentOrder.shippingFee.toFixed(2) : '免运费' }}</span>
          </div>
          <div v-if="currentOrder.discountAmount > 0" class="price-row discount">
            <span>优惠：</span>
            <span>-¥{{ currentOrder.discountAmount.toFixed(2) }}</span>
          </div>
          <div class="price-row total">
            <span>实付金额：</span>
            <span class="total-price">¥{{ (currentOrder.totalAmount + currentOrder.shippingFee - currentOrder.discountAmount).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.orders-page {
}

.order-count {
  font-size: 14px;
  color: #909399;
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
  transition: box-shadow 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
  cursor: pointer;
  transition: background 0.3s;
}

.order-item:hover {
  background: #f5f7fa;
  margin: 0 -8px;
  padding: 12px 8px;
  border-radius: 4px;
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

.order-actions {
  display: flex;
  gap: 8px;
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

.order-detail {
  padding: 10px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section h4 .el-icon {
  color: #e6a23c;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.detail-row .label {
  width: 80px;
  color: #909399;
}

.detail-row .value {
  color: #303133;
}

.address-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #303133;
}

.detail-items {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: background 0.3s;
}

.detail-item:hover {
  background: #f5f7fa;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.price-summary {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.price-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
  gap: 20px;
}

.price-row.discount {
  color: #67c23a;
}

.price-row.total {
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  margin-bottom: 0;
}

.price-row.total .total-price {
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
}
</style>
