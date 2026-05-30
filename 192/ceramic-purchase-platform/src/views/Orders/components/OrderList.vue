<template>
  <div class="order-list">
    <div v-if="orders.length > 0">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <span class="order-time">{{ order.createdAt }}</span>
          </div>
          <el-tag :type="orderStatusMap[order.status].color" size="large">
            {{ orderStatusMap[order.status].label }}
          </el-tag>
        </div>
        
        <div class="order-body">
          <div v-for="item in order.items" :key="item.materialId" class="order-item" @click="goToDetail(item.materialId)">
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-details">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-spec">规格：见详情</div>
            </div>
            <div class="item-price">¥{{ item.price }}</div>
            <div class="item-quantity">x{{ item.quantity }}</div>
            <div class="item-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-address">
            <el-icon><Location /></el-icon>
            <span>{{ order.contact }} | {{ order.address }}</span>
          </div>
          <div class="order-total">
            <span>共 {{ order.items.reduce((sum, i) => sum + i.quantity, 0) }} 件商品，合计：</span>
            <span class="total-price">¥{{ order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="order-actions">
          <el-button @click="$emit('view-detail', order)">查看明细</el-button>
          <el-button @click="$emit('verify', order)">金额核对</el-button>
          <template v-if="order.status === 'pending'">
            <el-button type="primary" @click="handlePay(order)">立即付款</el-button>
            <el-button @click="handleCancel(order)">取消订单</el-button>
          </template>
          <template v-else-if="order.status === 'paid'">
            <el-button @click="handleRemindShip(order)">提醒发货</el-button>
          </template>
          <template v-else-if="order.status === 'shipped'">
            <el-button type="primary" @click="handleConfirm(order)">确认收货</el-button>
            <el-button @click="handleViewLogistics(order)">查看物流</el-button>
          </template>
          <template v-else-if="order.status === 'completed'">
            <el-button @click="handleReview(order)">评价</el-button>
            <el-button @click="handleBuyAgain(order)">再次购买</el-button>
          </template>
        </div>
      </div>
    </div>
    <EmptyState v-else description="暂无订单" show-action action-text="去采购" @action="goHome" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderStatusMap } from '@/mock/orders'
import { useOrdersStore } from '@/store/orders'
import EmptyState from '@/components/EmptyState.vue'

defineProps({
  orders: {
    type: Array,
    default: () => []
  }
})

defineEmits(['view-detail', 'verify'])

const router = useRouter()
const ordersStore = useOrdersStore()

const goToDetail = (id) => {
  router.push(`/material/${id}`)
}

const goHome = () => {
  router.push('/')
}

const handlePay = (order) => {
  ElMessageBox.confirm(`确定支付订单 ¥${order.totalAmount} 吗？`, '确认支付', {
    confirmButtonText: '确认支付',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    ordersStore.updateOrderStatus(order.id, 'paid')
    ElMessage.success('支付成功')
  }).catch(() => {})
}

const handleCancel = (order) => {
  ElMessageBox.confirm('确定取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    ordersStore.updateOrderStatus(order.id, 'cancelled')
    ElMessage.success('订单已取消')
  }).catch(() => {})
}

const handleRemindShip = (order) => {
  ElMessage.success('已提醒商家发货')
}

const handleConfirm = (order) => {
  ElMessageBox.confirm('确定已收到货物吗？', '确认收货', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    ordersStore.updateOrderStatus(order.id, 'completed')
    ElMessage.success('已确认收货')
  }).catch(() => {})
}

const handleViewLogistics = (order) => {
  ElMessage.info('物流信息：顺丰速运 SF1234567890')
}

const handleReview = (order) => {
  ElMessage.info('评价功能开发中')
}

const handleBuyAgain = (order) => {
  ElMessage.success('已添加到购物车')
}
</script>

<style scoped>
.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f5f7fa;
}

.order-info {
  display: flex;
  gap: 24px;
  align-items: center;
}

.order-no {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.order-time {
  font-size: 13px;
  color: #909399;
}

.order-body {
  padding: 16px 24px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px dashed #ebeef5;
  cursor: pointer;
  transition: background 0.2s;
}

.order-item:hover {
  background: #fafafa;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.item-spec {
  font-size: 12px;
  color: #909399;
}

.item-price {
  width: 100px;
  text-align: right;
  color: #606266;
}

.item-quantity {
  width: 80px;
  text-align: center;
  color: #909399;
}

.item-subtotal {
  width: 120px;
  text-align: right;
  font-weight: 500;
  color: #f56c6c;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #fafafa;
  font-size: 13px;
}

.order-address {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.order-total {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f2f6fc;
}
</style>
