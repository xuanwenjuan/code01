<template>
  <div class="orders-page">
    <div class="container">
      <h2 class="page-title">我的订单</h2>
      
      <div class="order-stats">
        <div 
          v-for="(stat, key) in orderStats" 
          :key="key"
          class="stat-item"
          :class="{ active: activeTab === key }"
          @click="activeTab = key"
        >
          <span class="stat-count">{{ stat.count }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
      
      <div v-if="loading" class="content-wrapper">
        <LoadingState />
      </div>
      
      <div v-else class="content-wrapper">
        <div v-if="filteredOrders.length === 0" class="empty-wrapper">
          <EmptyState 
            text="暂无订单" 
            :show-action="true"
            action-text="去购物"
            @action="router.push('/products')"
          />
        </div>
        
        <div v-else class="order-list">
          <div 
            v-for="order in filteredOrders" 
            :key="order.id" 
            class="order-card vintage-border"
          >
            <div class="order-header">
              <div class="order-info">
                <span class="order-no">订单号：{{ order.orderNo }}</span>
                <span class="order-time">{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="order-status">
                <el-tag :type="getStatusType(order.status)" size="small">
                  {{ getStatusText(order.status) }}
                </el-tag>
              </div>
            </div>
            
            <div class="order-items">
              <div 
                v-for="item in order.items" 
                :key="`${order.id}-${item.productId}`" 
                class="order-item"
                @click="router.push(`/product/${item.productId}`)"
              >
                <img :src="item.image" :alt="item.name" class="item-img" />
                <div class="item-info">
                  <h4 class="item-name">{{ item.name }}</h4>
                  <p v-if="item.size" class="item-size">尺码：{{ item.size }}</p>
                  <p class="item-price">¥{{ item.price }} × {{ item.quantity }}</p>
                </div>
                <div class="item-total">
                  <span class="price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <div class="order-footer">
              <div class="order-total">
                共{{ getTotalQuantity(order) }}件商品，实付：
                <span class="price">¥{{ order.totalPrice.toFixed(2) }}</span>
              </div>
              <div class="order-actions">
                <el-button 
                  v-if="order.status === 'pending'" 
                  size="small" 
                  @click="handleCancel(order)"
                >取消订单</el-button>
                <el-button 
                  size="small" 
                  @click="goAfterSale(order)"
                >申请售后</el-button>
                <el-button 
                  v-if="order.status === 'pending'" 
                  type="primary" 
                  size="small"
                  @click="handlePay(order)"
                >立即付款</el-button>
                <el-button 
                  v-if="order.status === 'shipped'" 
                  type="primary" 
                  size="small"
                  @click="handleConfirm(order)"
                >确认收货</el-button>
                <el-button 
                  v-if="order.status === 'completed'" 
                  size="small"
                  @click="router.push('/products')"
                >再次购买</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import { formatDate, orderStatusMap } from '@/utils/validators'

const router = useRouter()
const orderStore = useOrderStore()

const loading = ref(true)
const activeTab = ref('all')

const orderStats = computed(() => {
  const stats = orderStore.getOrderStatistics()
  return {
    all: { label: '全部订单', count: stats.total },
    pending: { label: '待付款', count: stats.pending },
    paid: { label: '待发货', count: stats.paid },
    shipped: { label: '待收货', count: stats.shipped },
    completed: { label: '已完成', count: stats.completed }
  }
})

const filteredOrders = computed(() => {
  return orderStore.getOrdersByStatus(activeTab.value)
})

onMounted(() => {
  loadOrders()
})

const loadOrders = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

const getStatusText = (status) => {
  return orderStatusMap[status]?.text || status
}

const getStatusType = (status) => {
  return orderStatusMap[status]?.type || 'info'
}

const getTotalQuantity = (order) => {
  return order.items.reduce((sum, i) => sum + i.quantity, 0)
}

const handlePay = (order) => {
  ElMessageBox.confirm('确认支付该订单？', '提示', {
    confirmButtonText: '确认支付',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    orderStore.updateOrderStatus(order.id, 'paid')
    ElMessage.success('支付成功！')
    setTimeout(() => {
      orderStore.updateOrderStatus(order.id, 'shipped')
    }, 1500)
  }).catch(() => {})
}

const handleConfirm = (order) => {
  ElMessageBox.confirm('确认已收到商品？', '提示', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    orderStore.updateOrderStatus(order.id, 'completed')
    ElMessage.success('已确认收货！')
  }).catch(() => {})
}

const handleCancel = (order) => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    const success = orderStore.cancelOrder(order.id)
    if (success) {
      ElMessage.success('订单已取消')
    }
  }).catch(() => {})
}

const goAfterSale = (order) => {
  router.push({
    path: '/after-sales',
    query: { orderId: order.id }
  })
}
</script>

<style lang="scss" scoped>
.orders-page {
  padding: 40px 0;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c1810;
  margin-bottom: 24px;
}

.order-stats {
  display: flex;
  background: #fff;
  border-radius: 8px;
  padding: 0;
  margin-bottom: 24px;
  overflow: hidden;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
  
  &:hover {
    background: #faf8f5;
  }
  
  &.active {
    background: #faf8f5;
    border-bottom-color: #d4af37;
    
    .stat-label {
      color: #8b6914;
    }
  }
  
  .stat-count {
    font-size: 24px;
    font-weight: 700;
    color: #2c1810;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 14px;
    color: #666;
  }
}

.content-wrapper {
  min-height: 300px;
}

.empty-wrapper {
  padding: 60px 0;
}

.order-card {
  background: #fff;
  margin-bottom: 20px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #faf8f5;
  border-bottom: 1px solid #f0f0f0;
}

.order-info {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #666;
  
  .order-no {
    font-weight: 500;
    color: #333;
  }
}

.order-items {
  padding: 16px 24px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.3s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #faf8f5;
  }
  
  .item-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
  }
  
  .item-info {
    flex: 1;
    
    .item-name {
      font-size: 15px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }
    
    .item-size {
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }
    
    .item-price {
      font-size: 13px;
      color: #666;
    }
  }
  
  .item-total {
    text-align: right;
    
    .price {
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #faf8f5;
  border-top: 1px solid #f0f0f0;
}

.order-total {
  font-size: 14px;
  color: #666;
  
  .price {
    font-size: 18px;
    font-weight: 700;
    color: #c0392b;
  }
}

.order-actions {
  display: flex;
  gap: 12px;
  
  .el-button--primary {
    background: linear-gradient(135deg, #d4af37, #b8960c);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #e5c158, #c9a71d);
    }
  }
}

@media (max-width: 768px) {
  .order-stats {
    flex-wrap: wrap;
    
    .stat-item {
      flex: 0 0 33.33%;
      padding: 16px 8px;
      
      .stat-count {
        font-size: 18px;
      }
      
      .stat-label {
        font-size: 12px;
      }
    }
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
0%;
    justify-content: flex-end;
  }
}
</style>
