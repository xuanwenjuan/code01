<template>
  <div class="order-card card">
    <div class="order-header">
      <div class="order-info">
        <span class="order-no">
          <el-icon><Document /></el-icon>
          订单号：{{ order.id }}
        </span>
        <span class="order-time">
          <el-icon><Clock /></el-icon>
          {{ order.createTime }}
        </span>
        <span class="buyer-info" v-if="order.buyer">
          <el-icon><User /></el-icon>
          {{ order.buyer }}
        </span>
      </div>
      <StatusTag :status="order.status" type="order" />
    </div>

    <div class="order-content">
      <div class="product-info" @click="handleProductClick">
        <img :src="order.productImage" :alt="order.productName" loading="lazy" />
        <div class="product-detail">
          <h4 class="product-name">{{ order.productName }}</h4>
          <div class="product-meta">
            <span class="product-price">¥{{ order.price.toLocaleString() }} / 件</span>
            <span class="product-quantity">× {{ order.quantity }}</span>
          </div>
          <div class="order-extra" v-if="order.deliveryDate || order.usage">
            <el-tag v-if="order.deliveryDate" type="info" size="small">
              期望交货：{{ formatDate(order.deliveryDate) }}
            </el-tag>
            <el-tag v-if="order.usage" type="info" size="small">
              用途：{{ getUsageText(order.usage) }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="order-total">
        <p class="total-label">订单金额</p>
        <p class="total-price">¥{{ order.totalPrice.toLocaleString() }}</p>
        <p class="total-tip">含运费 ¥0.00</p>
      </div>

      <div class="order-actions">
        <template v-if="order.status === 'pending'">
          <el-button type="primary" size="small" @click="handlePay">
            <el-icon><Money /></el-icon>
            立即付款
          </el-button>
          <el-button size="small" @click="handleCancel">
            <el-icon><Close /></el-icon>
            取消订单
          </el-button>
        </template>
        <template v-else-if="order.status === 'shipped'">
          <el-button type="success" size="small" @click="handleConfirm">
            <el-icon><CircleCheck /></el-icon>
            确认收货
          </el-button>
          <el-button size="small" @click="handleViewDetail">
            <el-icon><View /></el-icon>
            查看物流
          </el-button>
        </template>
        <template v-else-if="order.status === 'completed'">
          <el-button type="warning" size="small" @click="handleBuyAgain">
            <el-icon><ShoppingCart /></el-icon>
            再次采购
          </el-button>
          <el-button size="small" @click="handleViewDetail">
            <el-icon><View /></el-icon>
            订单详情
          </el-button>
        </template>
        <template v-else>
          <el-button size="small" @click="handleViewDetail">
            <el-icon><View /></el-icon>
            订单详情
          </el-button>
        </template>
        <el-button size="small" @click="handleProductClick">
          <el-icon><Goods /></el-icon>
          商品详情
        </el-button>
      </div>
    </div>

    <div v-if="showCheckbox" class="order-footer">
      <el-checkbox v-model="checked" @change="handleCheck">
        选择此订单
      </el-checkbox>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document, Clock, User, Money, Close, CircleCheck, View,
  ShoppingCart, Goods
} from '@element-plus/icons-vue'
import StatusTag from './StatusTag.vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  showCheckbox: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['pay', 'cancel', 'confirm', 'buyAgain', 'viewDetail', 'productClick', 'check'])

const router = useRouter()
const checked = ref(false)

const usageMap = {
  production: '生产制造',
  research: '研发实验',
  maintenance: '设备维修',
  stock: '库存备货',
  other: '其他'
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const getUsageText = (usage) => usageMap[usage] || usage

const handlePay = () => {
  ElMessageBox.confirm(
    `确认支付订单 ¥${props.order.totalPrice.toLocaleString()}？`,
    '确认付款',
    {
      confirmButtonText: '确认支付',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    emit('pay', props.order)
  }).catch(() => {})
}

const handleCancel = () => {
  ElMessageBox.confirm(
    '确定要取消该订单吗？',
    '提示',
    {
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      type: 'warning'
    }
  ).then(() => {
    emit('cancel', props.order)
  }).catch(() => {})
}

const handleConfirm = () => {
  ElMessageBox.confirm(
    '确认已收到商品？',
    '确认收货',
    {
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    emit('confirm', props.order)
  }).catch(() => {})
}

const handleBuyAgain = () => {
  emit('buyAgain', props.order)
}

const handleViewDetail = () => {
  emit('viewDetail', props.order)
}

const handleProductClick = () => {
  router.push(`/product/${props.order.productId}`)
  emit('productClick', props.order)
}

const handleCheck = (val) => {
  emit('check', { order: props.order, checked: val })
}
</script>

<style scoped>
.order-card {
  overflow: hidden;
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.order-info {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #909399;
  flex-wrap: wrap;
}

.order-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.order-no {
  color: #303133;
  font-weight: 500;
}

.order-content {
  display: grid;
  grid-template-columns: 1fr 200px 180px;
  gap: 24px;
  padding: 20px 24px;
  align-items: center;
}

.product-info {
  display: flex;
  gap: 16px;
  cursor: pointer;
}

.product-info img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.product-detail {
  flex: 1;
  min-width: 0;
}

.product-name {
  margin: 0 0 8px;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.product-price {
  font-size: 13px;
  color: #f56c6c;
}

.product-quantity {
  font-size: 13px;
  color: #909399;
}

.order-extra {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.order-total {
  text-align: center;
}

.total-label {
  margin: 0 0 4px;
  font-size: 13px;
  color: #909399;
}

.total-price {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
}

.total-tip {
  margin: 0;
  font-size: 12px;
  color: #c0c4cc;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-actions .el-button {
  width: 100%;
}

.order-footer {
  padding: 12px 24px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
}

@media (max-width: 768px) {
  .order-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .order-total {
    text-align: left;
  }

  .order-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .order-actions .el-button {
    width: auto;
    flex: 1;
    min-width: 100px;
  }

  .order-info {
    gap: 12px;
  }
}
</style>
