<template>
  <div class="orders-page">
    <div class="container">
      <div class="page-header">
        <h2 class="page-title">我的订单</h2>
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部" name="">
            <template #label>
              <span>全部 <el-badge v-if="statusStats.all > 0" :value="statusStats.all" class="tab-badge" /></span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="待发货" name="待发货">
            <template #label>
              <span>待发货 <el-badge v-if="statusStats.pending > 0" :value="statusStats.pending" type="warning" class="tab-badge" /></span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="已发货" name="已发货">
            <template #label>
              <span>已发货 <el-badge v-if="statusStats.shipped > 0" :value="statusStats.shipped" type="primary" class="tab-badge" /></span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="已完成" name="已完成">
            <template #label>
              <span>已完成</span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="已取消" name="已取消">
            <template #label>
              <span>已取消</span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <EmptyState 
        v-if="filteredOrders.length === 0" 
        icon="📦" 
        text="暂无订单"
      >
        <template #action>
          <el-button type="primary" @click="goShopping">去逛逛</el-button>
        </template>
      </EmptyState>
      
      <div v-else class="orders-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">订单号：{{ order.id }}</span>
              <span class="order-time">
                <el-icon :size="14"><Clock /></el-icon>
                {{ order.createTime }}
              </span>
            </div>
            <div class="order-status">
              <el-tag 
                :type="getStatusType(order.status)" 
                effect="light"
                size="large"
              >
                {{ order.status }}
              </el-tag>
            </div>
          </div>
          
          <div class="order-items">
            <div 
              v-for="item in order.items" 
              :key="item.productId" 
              class="order-item"
              @click="goDetail(item.productId)"
            >
              <img :src="item.image" :alt="item.name" class="item-image" />
              <div class="item-info">
                <h4 class="item-name text-ellipsis">{{ item.name }}</h4>
                <p class="item-price">¥{{ item.price }}</p>
              </div>
              <span class="item-quantity">x{{ item.quantity }}</span>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="order-total">
              共{{ order.items.length }}件商品，合计：
              <span class="total-price">¥{{ order.totalPrice }}</span>
            </div>
            <div class="order-actions">
              <template v-if="order.status === '待发货'">
                <el-button size="small" @click="contactService">联系客服</el-button>
                <el-button size="small" type="danger" @click="cancelOrder(order.id)">取消订单</el-button>
              </template>
              <template v-else-if="order.status === '已发货'">
                <el-button size="small" @click="contactService">联系客服</el-button>
                <el-button size="small" type="primary" @click="viewTracking(order)">查看物流</el-button>
                <el-button size="small" type="success" @click="confirmReceive(order.id)">确认收货</el-button>
              </template>
              <template v-else-if="order.status === '已完成'">
                <el-button size="small" @click="viewTracking(order)">查看物流</el-button>
                <el-button size="small" type="success">评价晒单</el-button>
                <el-button size="small" type="primary" @click="buyAgain(order)">再次购买</el-button>
              </template>
              <template v-else-if="order.status === '已取消'">
                <el-button size="small" @click="deleteOrder(order.id)">删除订单</el-button>
                <el-button size="small" type="primary" @click="goShopping">重新购买</el-button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="trackingVisible" title="物流信息" width="500px">
      <div v-if="currentOrder" class="tracking-info">
        <div class="tracking-header">
          <div class="tracking-company">
            <el-icon :size="20" color="#667eea"><Van /></el-icon>
            <span>顺丰速运</span>
          </div>
          <el-tag type="primary" effect="light">{{ currentOrder.status }}</el-tag>
        </div>
        <div class="tracking-number">
          <span>物流单号：</span>
          <span class="number">{{ currentOrder.tracking || '暂无' }}</span>
          <el-button link type="primary" @click="copyTracking">复制</el-button>
        </div>
        <el-divider />
        <div class="tracking-steps">
          <el-timeline>
            <el-timeline-item
              v-for="(step, index) in trackingSteps"
              :key="index"
              :timestamp="step.time"
              :type="step.type"
              :hollow="step.hollow"
            >
              {{ step.content }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import EmptyState from '@/components/EmptyState.vue'
import { Clock, Van } from '@element-plus/icons-vue'

const router = useRouter()
const orderStore = useOrderStore()

const activeTab = ref('')
const trackingVisible = ref(false)
const currentOrder = ref(null)

const statusStats = computed(() => orderStore.getStatusStats())

const filteredOrders = computed(() => {
  return orderStore.getOrdersByStatus(activeTab.value)
})

const trackingSteps = computed(() => {
  if (!currentOrder.value) return []
  
  const baseSteps = [
    { time: '2024-01-15 14:30', content: '您的订单已发货，快递员正在揽收中', type: 'primary', hollow: false },
    { time: '2024-01-15 18:00', content: '快件已到达【杭州转运中心】', type: '', hollow: true },
    { time: '2024-01-16 08:30', content: '快件已从【杭州转运中心】发出，正在运往下一站', type: '', hollow: true },
    { time: '2024-01-16 16:00', content: '快件已到达【上海集散中心】', type: '', hollow: true }
  ]
  
  if (currentOrder.value.status === '已完成') {
    return [
      { time: '2024-01-17 10:30', content: '您的快件已签收，感谢您的购买！', type: 'success', hollow: false },
      ...baseSteps
    ]
  }
  
  return baseSteps
})

const getStatusType = (status) => {
  const map = {
    '待发货': 'warning',
    '已发货': 'primary',
    '已完成': 'success',
    '已取消': 'info'
  }
  return map[status] || 'info'
}

const handleTabChange = () => {}

const goShopping = () => {
  router.push('/')
}

const goDetail = (productId) => {
  router.push(`/detail/${productId}`)
}

const cancelOrder = (orderId) => {
  ElMessageBox.confirm('确定要取消该订单吗？取消后无法恢复。', '提示', {
    confirmButtonText: '确定取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    const result = orderStore.cancelOrder(orderId)
    if (result) {
      ElMessage.success('订单已取消')
    }
  }).catch(() => {})
}

const confirmReceive = (orderId) => {
  ElMessageBox.confirm('确认已收到商品吗？', '提示', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    const result = orderStore.confirmReceive(orderId)
    if (result) {
      ElMessage.success('确认收货成功')
    }
  }).catch(() => {})
}

const viewTracking = (order) => {
  currentOrder.value = order
  trackingVisible.value = true
}

const copyTracking = () => {
  if (currentOrder.value?.tracking) {
    navigator.clipboard.writeText(currentOrder.value.tracking)
    ElMessage.success('物流单号已复制')
  }
}

const deleteOrder = (orderId) => {
  ElMessageBox.confirm('确定要删除该订单吗？删除后无法恢复。', '提示', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const result = orderStore.deleteOrder(orderId)
    if (result) {
      ElMessage.success('订单已删除')
    }
  }).catch(() => {})
}

const buyAgain = (order) => {
  if (order.items && order.items.length > 0) {
    router.push(`/detail/${order.items[0].productId}`)
  }
}

const contactService = () => {
  ElMessage.info('正在连接客服...')
}

onMounted(() => {
  orderStore.loadOrders()
})
</script>

<style lang="scss" scoped>
.orders-page {
  padding: 30px 0 60px;
  
  .page-header {
    margin-bottom: 20px;
    
    .page-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #333;
    }
    
    .tab-badge {
      margin-left: 6px;
    }
  }
  
  .orders-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .order-card {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.3s;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }
    
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: #fafafa;
      border-bottom: 1px solid #f0f0f0;
      
      .order-info {
        display: flex;
        gap: 20px;
        align-items: center;
        
        .order-id {
          font-weight: 500;
          color: #333;
        }
        
        .order-time {
          color: #999;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
    
    .order-items {
      padding: 16px 20px;
      
      .order-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 0;
        cursor: pointer;
        
        &:hover {
          .item-name {
            color: #667eea;
          }
        }
        
        .item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        }
        
        .item-info {
          flex: 1;
          
          .item-name {
            font-size: 15px;
            color: #333;
            margin-bottom: 8px;
            transition: color 0.3s;
          }
          
          .item-price {
            color: #ff6b6b;
            font-weight: 500;
          }
        }
        
        .item-quantity {
          color: #999;
          font-size: 14px;
        }
      }
    }
    
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-top: 1px solid #f0f0f0;
      
      .order-total {
        font-size: 14px;
        color: #666;
        
        .total-price {
          font-size: 20px;
          font-weight: 700;
          color: #ff6b6b;
          margin-left: 4px;
        }
      }
      
      .order-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
  
  .tracking-info {
    .tracking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .tracking-company {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }
    
    .tracking-number {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      
      .number {
        font-weight: 500;
        color: #333;
        letter-spacing: 1px;
      }
    }
    
    .tracking-steps {
      max-height: 400px;
      overflow-y: auto;
    }
  }
}
</style>
